import { Component, Input } from '@angular/core';
import { ObservationsService } from '../../services/observations.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ToastService} from '../../services/toast.service';

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
        this.toastService.showSuccess('Éxito', 'Observación guardada');
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.toastService.showError('Error', 'Error al guardar la observación');
      }
    });
  }
}
