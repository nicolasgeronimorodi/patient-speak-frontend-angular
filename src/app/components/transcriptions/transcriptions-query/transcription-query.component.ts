import {
  Component,
  OnDestroy,
  OnInit,
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
  Subject,
  Subscription,
} from 'rxjs';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { TranscriptionsQueryGridViewComponent } from '../transcriptions-query-grid-view/transcriptions-query-grid-view.component';
import { TranscriptionsQueryCardViewComponent } from '../transcriptions-query-card-view/transcriptions-query-card-view.component';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../../services/toast.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { TagService } from '../../../services/tag.service';
import { PatientService } from '../../../services/patient.service';
import { CreateTagResponse } from '../../../models/response-interfaces/create-tag-response.interface';
import { PatientListItemViewModel } from '../../../models/view-models/patient-list-item.view.model';
import { ConfirmService } from '../../../services/confirm.service';

@Component({
  selector: 'app-transcription-query',
  providers: [ConfirmService],
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    AutoCompleteModule,
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

  // Tag filter
  tags: CreateTagResponse[] = [];
  tagOptions: { label: string; value: string | null }[] = [];
  selectedTagId: string | null = null;

  // Patient filter
  patientSuggestions: PatientListItemViewModel[] = [];
  selectedPatient: PatientListItemViewModel | null = null;

  // Date filter
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  private searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private transcriptionService: TranscriptionService,
    private tagService: TagService,
    private patientService: PatientService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Transcripciones', route: null, icon: 'description' }
    ]);

    this.loadTags();
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

  loadTags(): void {
    this.tagService.getTagsByFilter({ isGlobal: true, isValid: true }).subscribe({
      next: (tags) => {
        this.tags = tags;
        this.tagOptions = [
          { label: 'Todas las categorias', value: null },
          ...tags.map(t => ({ label: t.name, value: t.id }))
        ];
      },
      error: (err) => {
        console.error('Error loading tags:', err);
      }
    });
  }

  searchPatients(event: AutoCompleteCompleteEvent): void {
    const query = event.query;
    if (!query || query.length < 2) {
      this.patientSuggestions = [];
      return;
    }

    this.patientService.searchPatients(query).subscribe({
      next: (patients) => {
        this.patientSuggestions = patients;
      },
      error: () => {
        this.patientSuggestions = [];
      }
    });
  }

  onPatientSelect(event: AutoCompleteSelectEvent): void {
    this.selectedPatient = event.value as PatientListItemViewModel;
    this.currentPage = 1;
    this.loadVisibleTranscriptions();
  }

  onPatientClear(): void {
    this.selectedPatient = null;
    this.currentPage = 1;
    this.loadVisibleTranscriptions();
  }

  onTagFilterChange(): void {
    this.currentPage = 1;
    this.loadVisibleTranscriptions();
  }

  onDateFilterChange(): void {
    this.currentPage = 1;
    this.loadVisibleTranscriptions();
  }

  get hasActiveFilters(): boolean {
    return this.selectedTagId !== null
      || this.selectedPatient !== null
      || this.dateFrom !== null
      || this.dateTo !== null;
  }

  clearFilters(): void {
    this.selectedTagId = null;
    this.selectedPatient = null;
    this.dateFrom = null;
    this.dateTo = null;
    this.currentPage = 1;
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
      tagId: this.selectedTagId || undefined,
      patientId: this.selectedPatient?.id || undefined,
      createdAtFrom: this.dateFrom || undefined,
      createdAtTo: this.dateTo || undefined,
    };

    this.transcriptionService
      .getPaginatedTranscriptionsWithFilter(filter)
      .subscribe({
        next: (result) => {
          this.transcriptions = result.items;
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
    this.confirmService.confirmDelete('la transcripcion').subscribe((confirmed) => {
      if (!confirmed) return;

      this.transcriptionService.invalidateTranscription(id).subscribe({
        next: () => {
          this.loadVisibleTranscriptions();
          this.toastService.showSuccess('Exito', 'Transcripcion dada de baja correctamente');
        },
        error: (err) => {
          console.error('Error al dar de baja:', err.message);
          this.toastService.showError('Error', 'No se pudo dar de baja la transcripcion');
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.breadcrumbService.clear();
  }
}
