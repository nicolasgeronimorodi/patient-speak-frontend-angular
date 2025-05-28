import { Component } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { ActivatedRoute } from '@angular/router';
import { TranscriptionDetail } from '../../models/transcription-view-models';
import { CommonModule } from '@angular/common';
import { PermissionContextService } from '../../services/permission-context.service';
import { ObservationActionKey } from '../../enums/action-key';
import { ObservationNewComponent } from '../observation-new/observation-new.component';

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transcriptionService: TranscriptionService,
    private readonly permissionContextService: PermissionContextService
  ) {}

  ngOnInit(): void {
    this.transcriptionId = this.route.snapshot.paramMap.get('id');
    if (!this.transcriptionId) {
      this.errorMessage = 'ID de transcripción inválido.';
      this.loading = false;
      return;
    }

    this.transcriptionService.getTranscriptionById(this.transcriptionId).subscribe({
      next: (data) => {
        this.transcription = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }

  canAddObservation(): boolean {
    if (!this.transcription) return false;
    debugger;
    return this.permissionContextService.can(ObservationActionKey.AddObservation, {
      ownerId: this.transcription.userId
    });
  }

    toggleObservationPanel(): void {
    this.showAddObservation = !this.showAddObservation;
  }
}