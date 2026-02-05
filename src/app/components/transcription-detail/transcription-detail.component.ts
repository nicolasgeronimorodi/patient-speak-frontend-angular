import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationActionKey } from '../../enums/observation-action-key';
import { PermissionName } from '../../models/permission.model';
import { TranscriptionDetailViewModel } from '../../models/view-models/transcription-detail.view.model';
import { PatientDetailViewModel } from '../../models/view-models/patient-detail.view.model';
import { UserDetailViewModel } from '../../models/view-models/user/user-detail.view.model';
import { getRoleDisplayName } from '../../models/enums/role.enum';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PermissionContextService } from '../../services/permission-context.service';
import { TranscriptionService } from '../../services/transcription.service';
import { PatientService } from '../../services/patient.service';
import { ObservationNewComponent } from '../observation-new/observation-new.component';
import { ToastService } from '../../services/toast.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ConfirmService } from '../../services/confirm.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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
  professional: UserDetailViewModel | null = null;
  professionalRoleDisplay: string = '';
  loading = true;
  loadingPatient = false;
  loadingProfessional = false;
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
    private readonly confirmService: ConfirmService,
    private readonly userService: UserService
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

            // Cargar datos del paciente y del profesional
            this.loadPatient(data.patientId);
            this.loadProfessional(data.userId);

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

  private loadProfessional(userId: string): void {
    this.loadingProfessional = true;
    this.userService.getUserProfileById(userId).subscribe({
      next: (user) => {
        this.professional = user;
        this.professionalRoleDisplay = getRoleDisplayName(user.role?.name);
        this.loadingProfessional = false;
      },
      error: (err) => {
        console.error('Error loading professional:', err);
        this.loadingProfessional = false;
      }
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

    this.confirmService.confirmDelete('eliminar','la transcripción').subscribe((confirmed) => {
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

  /**
   * Exporta el detalle de la transcripcion a un archivo PDF.
   * Incluye informacion del paciente, profesional y contenido de la transcripcion.
   */
  exportToPdf(): void {
    if (!this.transcription) return;

    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Transcripcion', 14, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Motivo de consulta:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(this.transcription.consultationReason || 'Sin motivo', 60, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(this.transcription.createdAt), 60, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Categoria:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(this.transcription.tagName || '-', 60, yPosition);
    yPosition += 15;

    if (this.patient) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Informacion del Paciente', '']],
        body: [
          ['Nombre completo', this.patient.fullName || '-'],
          ['Documento', `${this.patient.documentTypeName || ''} ${this.patient.documentNumber || 'Sin documento'}`],
          ['Consentimiento', this.patient.consentGiven ? 'Otorgado' : 'Pendiente'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if (this.professional) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Informacion del Profesional', '']],
        body: [
          ['Nombre completo', this.professional.fullName || '-'],
          ['Rol', this.professionalRoleDisplay || '-'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Contenido de la Transcripcion:', 14, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const contentLines = doc.splitTextToSize(this.transcription.content || '-', 180);
    doc.text(contentLines, 14, yPosition);

    const timestamp = this.getTimestamp();
    doc.save(`transcripcion_${this.transcription.id}_${timestamp}.pdf`);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  }
}
