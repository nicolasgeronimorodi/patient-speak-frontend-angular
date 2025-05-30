import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranscriptionListItemViewModel } from '../../models/view-models/transcription-list-item.view.model';
import { TranscriptionService } from '../../services/transcription.service';

import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { debounceTime, distinctUntilChanged, Observable, Subject, Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-transcription-query',
  imports: [CommonModule, FormsModule, CardModule, InputTextModule],
  templateUrl: './transcription-query.component.html',
  styleUrl: './transcription-query.component.css',
})
export class TranscriptionQueryComponent implements OnInit, OnDestroy {
  loadingTranscriptionsErrorMessage: string | null = null;
  isLoading: boolean = false;
  transcriptions: TranscriptionListItemViewModel[] = [];

  currentPage = 1;
  pageSize = 6;
  totalItems = 0;

  searchTerm: string = '';
  private searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(private readonly transcriptionService: TranscriptionService, private readonly router: Router) {}

  ngOnInit(): void {
   this.handleSearchInput();
  }

  handleSearchInput(){
    
    this.searchSub=this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.loadVisibleTranscriptions();
    })
    this.loadVisibleTranscriptions();
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
    this.loadingTranscriptionsErrorMessage = null;

    this.transcriptionService
      .getPaginatedVisibleTranscriptions({
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchTerm,
      })
      .subscribe({
        next: (result) => {
          this.transcriptions = result.items;
          this.totalItems = result.total;
          this.isLoading = false;
        },
        error: (error) => {
          this.loadingTranscriptionsErrorMessage = error.message;
          this.isLoading = false;
          console.error('Error al cargar transcripciones visibles:', error);
        },
      });
  }

    getPaginationLabel(): string {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    return `Página ${this.currentPage} de ${totalPages}`;
  }

  navigateToTranscriptionDetail(id: string){
    this.router.navigate(['/transcriptions', id]);
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }
}
