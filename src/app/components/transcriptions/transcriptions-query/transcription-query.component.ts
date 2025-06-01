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
    private router: Router
  ) {}

  ngOnInit(): void {
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

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
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
    console.log('Deactivate transcription:', id);
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }
}
