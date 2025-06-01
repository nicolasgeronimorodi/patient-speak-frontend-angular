import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transcriptions-query-card-view',
  imports: [CommonModule, CardModule],
  templateUrl: './transcriptions-query-card-view.component.html',
  styleUrl: './transcriptions-query-card-view.component.css'
})
export class TranscriptionsQueryCardViewComponent {
  @Input() transcriptions: TranscriptionListItemViewModel[] = [];
  @Input() totalItems = 0;
  @Input() pageSize = 6;
  @Input() isLoading = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() navigateToDetail = new EventEmitter<string>();
  @Output() deactivate = new EventEmitter<string>();

  currentPage = 1;

  onPageChange(direction: 'next' | 'prev') {
    if (direction === 'next') {
      this.currentPage++;
    } else {
      this.currentPage = Math.max(1, this.currentPage - 1);
    }
    this.pageChange.emit(this.currentPage);
  }
}