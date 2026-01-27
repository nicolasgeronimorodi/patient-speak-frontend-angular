import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationActionKey } from '../../enums/observation-action-key';
import { PermissionName } from '../../models/permission.model';
import { TranscriptionDetailViewModel } from '../../models/view-models/transcription-detail.view.model';
import { PatientDetailViewModel } from '../../models/view-models/patient-detail.view.model';
import { AuthService } from '../../services/auth.service';
import { PermissionContextService } from '../../services/permission-context.service';
import { TranscriptionService } from '../../services/transcription.service';
import { PatientService } from '../../services/patient.service';
import { ObservationNewComponent } from '../observation-new/observation-new.component';
import { ToastService } from '../../services/toast.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ConfirmService } from '../../services/confirm.service';


@Component({
  selector: 'app-transcription-detail',
  providers: [ConfirmService],
  imports: [CommonModule, ObservationNewComponent],
  templateUrl: './transcription-detail.component.html',
  styleUrl: './transcription-detail.component.css',
})
export class TranscriptionDetailComponent implements OnInit, OnDestroy {
  transcriptionId: string | null = null;
  transcription: TranscriptionDetailViewModel | null = null;
  patient: PatientDetailViewModel | null = null;
  loading = true;
  loadingPatient = false;
  errorMessage: string | null = null;
  showAddObservation = false;
  canAddObservation = false;
  currentUserId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transcriptionService: TranscriptionService,
    private readonly patientService: PatientService,
    private readonly permissionContextService: PermissionContextService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    // Set breadcrumbs
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Transcripciones', route: '/home', icon: 'description' },
      { label: 'Detalle', route: null, icon: 'visibility' }
    ]);

    this.transcriptionId = this.route.snapshot.paramMap.get('id');
    if (!this.transcriptionId) {
      this.errorMessage = 'ID de transcripción inválido.';
      this.loading = false;
      return;
    }

    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user?.id ?? null;

      this.transcriptionService
        .getTranscriptionById(this.transcriptionId!)
        .subscribe({
          next: (data) => {
            this.transcription = data;
            this.loading = false;

            // Cargar datos del paciente
            this.loadPatient(data.patientId);

            // Permisos
            this.permissionContextService
              .getCurrentUsersPermissionsForActions([
                ObservationActionKey.AddObservation,
              ])
              .subscribe({
                next: (map) => {
                  this.canAddObservation =
                    PermissionContextService.evaluateRestrictivePermission(
                      map,
                      'observation:create:own' as PermissionName,
                      'observation:create:all' as PermissionName,
                      this.transcription!.userId === this.currentUserId
                    );
                },
                error: (err) => {
                  console.error('Error checking permissions', err);
                  this.canAddObservation = false;
                },
              });
          },
          error: (err) => {
            this.errorMessage = err.message;
            this.loading = false;
          },
        });
    });
  }

  private loadPatient(patientId: string): void {
    this.loadingPatient = true;
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.loadingPatient = false;
      },
      error: (err) => {
        console.error('Error loading patient:', err);
        this.loadingPatient = false;
      }
    });
  }

  toggleObservationPanel(): void {
    this.showAddObservation = !this.showAddObservation;
  }

  goToObservations(): void {
    if (!this.transcription?.id) return;
    this.router.navigate([
      '/transcriptions',
      this.transcription.id,
      'observations',
    ]);
  }

  sendTranscriptionEmailToCurrentUser(): void {
  if (!this.transcription?.id) return;

  this.transcriptionService.sendTranscriptionToCurrentUserEmail(this.transcription.id)
    .subscribe({
      next: () => this.toastService.showSuccess('Correo enviado', 'La transcripción ha sido enviada al correo electrónico.'),
      error: (err) => this.toastService.showError('Error al enviar correo', err.message)
    });
}

  onDeleteTranscription(): void {
    if (!this.transcription?.id) return;

    this.confirmService.confirmDelete('la transcripcion').subscribe((confirmed) => {
      if (!confirmed) return;

      this.transcriptionService.deleteTranscription(this.transcription!.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Exito', 'Transcripcion eliminada correctamente');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error al eliminar transcripcion:', err.message);
          this.toastService.showError('Error', 'No se pudo eliminar la transcripcion');
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
