import { Component, Input } from '@angular/core';
import { ObservationsService } from '../../services/observations.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/common/toast.service';

@Component({
  selector: 'app-observation-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observation-new.component.html',
  styleUrl: './observation-new.component.css'
})
export class ObservationNewComponent {
  @Input() transcriptionId!: string;


  content: string = '';
  isSubmitting: boolean = false;

  constructor(private observationService: ObservationsService, private toastService: ToastService) {}

  submitObservation(): void {
    if (!this.transcriptionId || !this.content?.trim()) return;

    this.isSubmitting = true;

    this.observationService.createObservation(this.transcriptionId, this.content).subscribe({
      next: () => {
        this.content = '';
        this.isSubmitting = false;
        this.toastService.showSuccess('Éxito', 'Observación guardada con éxito.');
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.toastService.showError('Error', 'Ocurrió un error al guardar la observación.');

      }
    });
  }
}
/*
export class ObservationNewComponent {
  @Input() transcriptionId!: string;
  content = '';

  constructor(private observationService: ObservationsService) {}

  save(): void {
    if (!this.transcriptionId || !this.content.trim()) return;

    this.observationService.createObservation({
      transcriptionId: this.transcriptionId,
      content: this.content.trim()
    }).subscribe({
      next: () => {
        this.content = '';
        alert('Observación guardada con éxito.');
      },
      error: err => alert(err.message)
    });
  }
}
*/