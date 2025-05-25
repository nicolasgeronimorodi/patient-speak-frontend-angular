import { Component, OnInit } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { TranscriptionListItem } from '../../models/transcription-view-models';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../../interfaces/pagination.interface';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transcriptions',
  imports: [CommonModule, FormsModule, CardModule, InputTextModule],
  templateUrl: './transcriptions.component.html',
  styleUrl: './transcriptions.component.css',
})
export class TranscriptionsComponent implements OnInit {
  loadingTranscriptionsErrorMessage: string | null = null;
  isLoading: boolean = false;
  transcriptions: TranscriptionListItem[] = [];

  currentPage = 1;
  pageSize = 6;
  totalItems = 0;

  searchTerm: string = '';

  constructor(private readonly transcriptionService: TranscriptionService) {}

  ngOnInit(): void {
    this.loadVisibleTranscriptions();
  }

   onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadVisibleTranscriptions();
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
}
