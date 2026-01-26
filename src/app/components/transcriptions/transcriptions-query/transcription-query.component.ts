import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
import { TranscriptionFilterViewModel } from '../../../models/view-models/transcription-filter.view.model';
import { TranscriptionService } from '../../../services/transcription.service';

import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TranscriptionsQueryGridViewComponent } from '../transcriptions-query-grid-view/transcriptions-query-grid-view.component';
import { TranscriptionsQueryCardViewComponent } from '../transcriptions-query-card-view/transcriptions-query-card-view.component';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../../services/toast.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';

@Component({
  selector: 'app-transcription-query',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TranscriptionsQueryGridViewComponent,
    TranscriptionsQueryCardViewComponent,
  ],
  templateUrl: './transcription-query.component.html',
  styleUrl: './transcription-query.component.css',
})
export class TranscriptionQueryComponent implements OnInit, OnDestroy {
  transcriptions: TranscriptionListItemViewModel[] = [];
  totalItems = 0;
  totalItems$ = new BehaviorSubject<number>(0);
  pageSize = 6;
  currentPage = 1;
  isLoading = false;
  searchTerm = '';
  viewMode: 'grid' | 'card' = 'grid';

  private searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private transcriptionService: TranscriptionService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Transcripciones', route: null, icon: 'description' }
    ]);

    this.handleSearchInput();
  }

  handleSearchInput(): void {
    this.searchSub = this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.loadVisibleTranscriptions();
      });
    this.loadVisibleTranscriptions();
  }

  setViewMode(mode: 'grid' | 'card') {
    this.viewMode = mode;
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

onPageChange(event: { page: number; pageSize: number }): void {
  this.currentPage = event.page;
  this.pageSize = event.pageSize;
  this.loadVisibleTranscriptions();
}

  loadVisibleTranscriptions(): void {
    this.isLoading = true;

    const filter: TranscriptionFilterViewModel = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      isValid: true,
    };

    this.transcriptionService
      .getPaginatedTranscriptionsWithFilter(filter)
      .subscribe({
        next: (result) => {
          this.transcriptions = result.items;
          console.log('this.transcriptions ', this.transcriptions)
          this.totalItems$.next(result.total);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading transcriptions:', err);
          this.isLoading = false;
        },
      });
  }

  navigateToTranscriptionDetail(id: string): void {
    this.router.navigate(['/transcriptions', id]);
  }

  onDeactivateTranscription(id: string): void {
  this.transcriptionService.invalidateTranscription(id).subscribe({
    next: () => {
      this.loadVisibleTranscriptions();
      this.toastService.showSuccess('Éxito', 'Transcripción dada de baja correctamente');
    },
    error: (err) => {
      console.error('Error al dar de baja:', err.message);
      this.toastService.showError('Error', 'No se pudo dar de baja la transcripción');
    }
  });
}


  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.breadcrumbService.clear();
  }
}
