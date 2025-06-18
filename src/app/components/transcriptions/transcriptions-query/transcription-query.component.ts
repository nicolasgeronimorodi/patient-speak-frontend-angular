import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
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
import { TagService } from '../../../services/tag.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';


@Component({
  selector: 'app-transcription-query',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
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

  tags: { id: string; name: string }[] = [];
  selectedTagId: string | null = null;
  createdAtFrom: Date | null = null;
  createdAtTo: Date | null = null;

  private searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private transcriptionService: TranscriptionService,
    private tagService: TagService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {}

  loadGlobalTags(): void {
    this.tagService.getAllGlobalTags().subscribe({
      next: (res) => (this.tags = res),
      error: (err) => console.error('Error loading tags:', err),
    });
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
    this.loadVisibleTranscriptions();
  }

  ngOnInit(): void {

    this.buildBreadcrumb();
    this.loadGlobalTags();
    this.handleSearchInput();
  }

  buildBreadcrumb() {
    this.breadcrumbService.buildBreadcrumb([
      {
        label: 'Home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Transcripciones',
      },
      {
        label: 'Consulta',
      },
    ]);
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
    this.transcriptionService
      .getPaginatedVisibleTranscriptions({
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchTerm,
      })
      .subscribe({
        next: (result) => {
          this.transcriptions = result.items;
          this.totalItems$.next(result.total);

          console.log('Página actual:', this.currentPage);
          console.log('Total transcripciones:', result.total);
          console.log('Items recibidos:', result.items.length);
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
        this.toastService.showSuccess(
          'Éxito',
          'Transcripción dada de baja correctamente'
        );
      },
      error: (err) => {
        console.error('Error al dar de baja:', err.message);
        this.toastService.showError(
          'Error',
          'No se pudo dar de baja la transcripción'
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.breadcrumbService.clear();
  }
}
