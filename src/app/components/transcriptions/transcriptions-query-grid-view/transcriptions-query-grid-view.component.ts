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
@Component({
  selector: 'app-transcriptions-query-grid-view',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
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

  @Output() pageChange = new EventEmitter<number>();
  @Output() navigateToDetail = new EventEmitter<string>();
  @Output() deactivate = new EventEmitter<string>();


  totalItems = 0;

  ngOnInit(): void {
    this.totalItems$.subscribe((value) => {
      this.totalItems = value;
      console.log('Total items actualizado reactivamente:', value);
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems']) {
      console.log('Grid received updated totalItems:', this.totalItems);
    }
  }

loadTranscriptionsLazy(event: TableLazyLoadEvent) {
  const page = event.first ? event.first / (event.rows ?? 1) + 1 : 1;
  this.pageChange.emit(page);
}

  handlePageChange(event: any) {
    debugger;
    const newPage = event.first / event.rows + 1;
    this.pageChange.emit(newPage);
  }

  truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
