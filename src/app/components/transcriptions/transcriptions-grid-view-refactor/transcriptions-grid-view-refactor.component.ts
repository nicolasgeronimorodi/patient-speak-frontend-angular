import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TranscriptionQueryPageFacadeService } from '../../../services/page-facades/transcription-query-page-facade.service';
import { ToastService } from '../../../services/common/toast.service';
import { Subscription } from 'rxjs';
import { TranscriptionFilterViewModel } from '../../../interfaces/common/filterViewModels/transcriptionFilterViewModel';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { FilterMetadata } from 'primeng/api';
import { Router } from '@angular/router';
import { CreateTagResponse } from '../../../models/response-interfaces/create-tag-response.interface';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';

@Component({
  selector: 'app-transcriptions-grid-view-refactor',
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
  ],
  templateUrl: './transcriptions-grid-view-refactor.component.html',
  styleUrl: './transcriptions-grid-view-refactor.component.css',
})
export class TranscriptionsGridViewRefactorComponent
  implements OnInit, OnDestroy
{
  subs: Subscription = new Subscription();
  tags: CreateTagResponse[] = [];

  entities: TranscriptionListItemViewModel[] = [];
  totalItems = 0;

  isLoading = false;

  constructor(
    private toastService: ToastService,
    private router: Router,
    public facadeService: TranscriptionQueryPageFacadeService
  ) {}

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }
  ngOnInit(): void {
    this.facadeService.initialize();
    this.subscribeAll();

  }

  subscribeAll() {
    this.subs.add(
      this.facadeService.tags$.subscribe((tags) => {
        this.tags = tags;
          console.log('tags cargados:', this.tags);
      })
    );
    this.subs.add(
      this.facadeService.entities$.subscribe((entities) => {
        this.entities = entities;
      })
    );
    this.subs.add(
      this.facadeService.totalItems$.subscribe((total) => {
        this.totalItems = total;
      })
    );
    this.subs.add(
      this.facadeService.isLoading$.subscribe((isLoading) => {
        this.isLoading = isLoading;
      })
    );
  }

  truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  get cleanedFilters(): { [s: string]: FilterMetadata | FilterMetadata[] } {
    const filters = this.facadeService.lazyLoadEvent.filters || {};
    const cleaned: { [s: string]: FilterMetadata | FilterMetadata[] } = {};

    Object.keys(filters).forEach((key) => {
      const val = filters[key];
      if (val !== undefined) {
        cleaned[key] = val;
      }
    });

    return cleaned;
  }

  onDeactivateTranscription(transcriptionId: string) {
    const observable =
      this.facadeService.deactivateTranscription(transcriptionId);
    this.subs.add(
      observable.subscribe({
        next: () => {
          this.facadeService.loadVisibleTranscriptions(
            {} as TranscriptionFilterViewModel
          );
          this.toastService.showSuccess(
            'Éxito',
            'Transcripción dada de baja correctamente'
          );
        },
        error: (err) => {
          this.toastService.showError(
            'Error',
            'No se pudo dar de baja la transcripción'
          );
          console.error('Error al dar de baja la transcripción:', err);
        },
      })
    );
  }

  navigateToTranscriptionDetail(id: string): void {
    this.router.navigate(['/transcriptions', id]);
  }
}
