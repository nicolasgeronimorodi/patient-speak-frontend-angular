import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ObservationViewModel } from '../../models/view-models/observation.view.model';
import { ObservationsService } from '../../services/observations.service';
import { PaginatedResult } from '../../interfaces/pagination.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-observations-query',
  imports: [CommonModule, CardModule],
  templateUrl: './observations-query.component.html',
  styleUrl: './observations-query.component.css'
})
export class ObservationsQueryComponent implements OnInit {

  transcriptionId: string | null = null;
  loadingObservationsErrorMessage: string | null = null;
  isLoading: boolean = false;
  observations: ObservationViewModel[] = [];

  currentPage = 1;
  pageSize = 6;
  totalItems = 0;

  constructor(private readonly observationsService: ObservationsService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  ngOnInit(): void {
    this.transcriptionId = this.route.snapshot.paramMap.get('id')!;
    this.loadObservations();
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadObservations();
  }

  loadObservations(): void {
    this.isLoading = true;
    this.loadingObservationsErrorMessage = null;
    if(this.transcriptionId === null || undefined) {return;}

    this.observationsService
      .getPaginatedObservationsForTranscription({
        transcriptionId: this.transcriptionId,
        page: this.currentPage,
        pageSize: this.pageSize
      })
      .subscribe({
        next: (result: PaginatedResult<ObservationViewModel>) => {
          this.observations = result.items;
          this.totalItems = result.total;
          this.isLoading = false;
        },
        error: (error) => {
          this.loadingObservationsErrorMessage = error.message;
          this.isLoading = false;
          console.error('Error al cargar observaciones:', error);
        }
      });
  }

  getPaginationLabel(): string {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    return `Página ${this.currentPage} de ${totalPages}`;
  }

  goBackToTranscriptionDetail(): void {
  this.router.navigate(['/transcriptions', this.transcriptionId]);
}
}