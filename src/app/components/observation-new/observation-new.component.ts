import { Component, Input } from '@angular/core';
import { ObservationsService } from '../../services/observations.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-observation-new',
  imports: [CommonModule, FormsModule],
  templateUrl: './observation-new.component.html',
  styleUrl: './observation-new.component.css'
})
export class ObservationNewComponent {
  @Input() transcriptionId!: string;
  @Input() visible: boolean = false;

  content: string = '';
  isSubmitting: boolean = false;

  constructor(private observationService: ObservationsService) {}

  submitObservation(): void {
    if (!this.transcriptionId || !this.content?.trim()) return;

    this.isSubmitting = true;

    this.observationService.createObservation(this.transcriptionId, this.content).subscribe({
      next: () => {
        this.content = '';
        this.isSubmitting = false;
        // Acá podría emitir un evento o mostrar una notificación 
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
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