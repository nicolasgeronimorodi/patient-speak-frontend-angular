import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transcriptions-query-card-view',
  imports: [CommonModule, CardModule],
  templateUrl: './transcriptions-query-card-view.component.html',
  styleUrl: './transcriptions-query-card-view.component.css'
})
export class TranscriptionsQueryCardViewComponent implements OnInit, OnChanges {
  @Input() transcriptions: TranscriptionListItemViewModel[] = [];
  @Input() totalItems$! : Observable<number>;

  @Input() pageSize = 6;
  @Input() currentPage = 1;
  @Input() isLoading = false;

   @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() navigateToDetail = new EventEmitter<string>();
  @Output() deactivate = new EventEmitter<string>();

  totalItems = 0;


  ngOnInit(): void {
    this.totalItems$.subscribe((value)=>{
      this.totalItems = value;
      console.log('Total items actualizado reactivamente en QUERY CARD VIEW:', value);
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔍 [CARD VIEW] totalItems:', this.totalItems);
    console.log('📄 [CARD VIEW] currentPage:', this.currentPage);
    console.log('📦 [CARD VIEW] pageSize:', this.pageSize);
  }

  onPageChange(direction: 'next' | 'prev') {
    if (direction === 'next') {
      this.currentPage++;
    } else {
      this.currentPage = Math.max(1, this.currentPage - 1);
    }
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }
}