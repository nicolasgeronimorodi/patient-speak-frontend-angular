import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ActionMenuComponent } from '../../shared/action-menu/action-menu.component';

@Component({
  selector: 'app-transcriptions-query-card-view',
  imports: [CommonModule, DatePipe, ActionMenuComponent],
  templateUrl: './transcriptions-query-card-view.component.html',
  styleUrl: './transcriptions-query-card-view.component.css'
})
export class TranscriptionsQueryCardViewComponent implements OnInit, OnChanges {
  @Input() transcriptions: TranscriptionListItemViewModel[] = [];
  @Input() totalItems$!: Observable<number>;

  @Input() pageSize = 6;
  @Input() currentPage = 1;
  @Input() isLoading = false;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() navigateToDetail = new EventEmitter<string>();
  @Output() deactivate = new EventEmitter<string>();

  totalItems = 0;

  cardActions = [
    { id: 'deactivate', label: 'Desactivar', icon: 'pi pi-ban', styleClass: 'text-red-500' }
  ];

  ngOnInit(): void {
    this.totalItems$.subscribe((value) => {
      this.totalItems = value;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  onPageChange(direction: 'next' | 'prev') {
    if (direction === 'next') {
      this.currentPage++;
    } else {
      this.currentPage = Math.max(1, this.currentPage - 1);
    }
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  /**
   * Generates an array of page numbers for pagination display.
   * Shows up to 5 pages centered around the current page.
   */
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  onCardAction(actionId: string, item: TranscriptionListItemViewModel): void {
    if (actionId === 'deactivate') {
      this.deactivate.emit(item.id);
    }
  }

  onPlayClick(event: Event, item: TranscriptionListItemViewModel) {
    event.stopPropagation();
    this.navigateToDetail.emit(item.id);
  }
}
