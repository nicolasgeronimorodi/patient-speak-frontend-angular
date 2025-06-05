import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationActionKey } from '../../enums/observation-action-key';
import { PermissionName } from '../../models/permission.model';
import { TranscriptionDetailViewModel } from '../../models/view-models/transcription-detail.view.model';
import { AuthService } from '../../services/auth.service';
import { PermissionContextService } from '../../services/permission-context.service';
import { TranscriptionService } from '../../services/transcription.service';
import { ObservationNewComponent } from '../observation-new/observation-new.component';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-transcription-detail',
  imports: [CommonModule, ObservationNewComponent],
  templateUrl: './transcription-detail.component.html',
  styleUrl: './transcription-detail.component.css',
})
export class TranscriptionDetailComponent {
  transcriptionId: string | null = null;
  transcription: TranscriptionDetailViewModel | null = null;
  loading = true;
  errorMessage: string | null = null;
  showAddObservation = false;
  canAddObservation = false;
  currentUserId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transcriptionService: TranscriptionService,
    private readonly permissionContextService: PermissionContextService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
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
}
