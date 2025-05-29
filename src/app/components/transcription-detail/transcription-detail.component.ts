import { Component } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranscriptionDetail } from '../../models/transcription-view-models';
import { CommonModule } from '@angular/common';
import { PermissionContextService } from '../../services/permission-context.service';
import { ObservationActionKey } from '../../enums/action-key';
import { ObservationNewComponent } from '../observation-new/observation-new.component';
import { PermissionName } from '../../models/permission.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transcription-detail',
  imports: [CommonModule, ObservationNewComponent],
  templateUrl: './transcription-detail.component.html',
  styleUrl: './transcription-detail.component.css',
})
export class TranscriptionDetailComponent {
  transcriptionId: string | null = null;
  transcription: TranscriptionDetail | null = null;
  loading = true;
  errorMessage: string | null = null;
  showAddObservation = false;
  canAddObservation = false;
  currentUserId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transcriptionService: TranscriptionService,
    private readonly permissionContextService: PermissionContextService,
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
}
