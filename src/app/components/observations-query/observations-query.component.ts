import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatedResult } from '../../interfaces/pagination.interface';
import { ObservationViewModel } from '../../models/view-models/observation.view.model';
import { ObservationsService } from '../../services/observations.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-observations-query',
  providers: [ConfirmService],
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './observations-query.component.html',
  styleUrl: './observations-query.component.css'
})
export class ObservationsQueryComponent implements OnInit, OnDestroy {

  transcriptionId: string | null = null;
  loadingObservationsErrorMessage: string | null = null;
  isLoading: boolean = false;
  observations: ObservationViewModel[] = [];
  isAdmin = false;

  currentPage = 1;
  pageSize = 6;
  totalItems = 0;

  constructor(
    private readonly observationsService: ObservationsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Transcripciones', route: '/home', icon: 'description' },
      { label: 'Observaciones', route: null, icon: 'comment' }
    ]);

    this.authService.isUserAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

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

  onDeleteObservation(observation: ObservationViewModel): void {
    this.confirmService.confirmDelete('eliminar la observacion de', observation.createdByName || 'autor desconocido').subscribe(confirmed => {
      if (confirmed) {
        this.observationsService.deleteObservation(observation.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Exito', 'Observacion eliminada correctamente');
            this.loadObservations();
          },
          error: (err) => {
            this.toastService.showError('Error', err.message);
          }
        });
      }
    });
  }

  goBackToTranscriptionDetail(): void {
    this.router.navigate(['/transcriptions', this.transcriptionId]);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}