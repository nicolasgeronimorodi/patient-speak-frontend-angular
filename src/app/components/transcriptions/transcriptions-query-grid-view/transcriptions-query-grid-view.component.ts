import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Observable } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-transcriptions-query-grid-view',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './transcriptions-query-grid-view.component.html',
  styleUrl: './transcriptions-query-grid-view.component.css',
})
export class TranscriptionsQueryGridViewComponent implements OnInit, OnChanges {
  @Input() transcriptions: TranscriptionListItemViewModel[] = [];
  @Input() totalItems$!: Observable<number>;

  @Input() pageSize = 6;
  @Input() currentPage = 1;
  @Input() isLoading = false;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() navigateToDetail = new EventEmitter<string>();
  @Output() deactivate = new EventEmitter<string>();

  totalItems = 0;

  ngOnInit(): void {
    this.totalItems$.subscribe((value) => {
      this.totalItems = value;
      console.log('Total items actualizado reactivamente en QUERY GRID VIEW:', value);
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems']) {
      console.log('Grid received updated totalItems:', this.totalItems);
    }
  }

  loadTranscriptionsLazy(event: TableLazyLoadEvent) {
  const newPageSize = event.rows ?? this.pageSize;
  const newPage = event.first ? event.first / newPageSize + 1 : 1;

  this.pageChange.emit({ page: newPage, pageSize: newPageSize });
}

 handlePageChange(event: TableLazyLoadEvent) {
  const newPage = event.first !== undefined && event.rows
    ? event.first / event.rows + 1
    : 1;

  const pageSize = event.rows ?? this.pageSize;

  this.pageChange.emit({ page: newPage, pageSize });
}

  truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
