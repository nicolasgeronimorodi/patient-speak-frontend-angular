import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranscriptionListItemViewModel } from '../../../models/view-models/transcription-list-item.view.model';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Observable } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { OperatorUserSimpleViewModel } from '../../../models/view-models/user/operator-user-simple-view.model';
@Component({
  selector: 'app-transcriptions-query-grid-view',
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    DatePicker
  ],
  templateUrl: './transcriptions-query-grid-view.component.html',
  styleUrl: './transcriptions-query-grid-view.component.css',
})
export class TranscriptionsQueryGridViewComponent implements OnInit, OnChanges {
  @Input() isAdmin: boolean = false;
  @Input() transcriptions: TranscriptionListItemViewModel[] = [];
  @Input() totalItems$!: Observable<number>;

  @Input() pageSize = 6;
  @Input() currentPage = 1;
  @Input() isLoading = false;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() navigateToDetail = new EventEmitter<string>();
  @Output() deactivate = new EventEmitter<string>();

  totalItems = 0;

  rangeDates: Date[] | undefined;

  @Output() gridViewFiltersChanged = new EventEmitter<{
  tagId?: string;
  operatorUserId?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
}>();


@Input() tags: { id: string; name: string }[] = [];
@Input() operatorUsers: OperatorUserSimpleViewModel[] = [];

selectedTagId?: string;
selectedOperatorId?: string;
createdAtFrom?: Date;
createdAtTo?: Date;

@ViewChild('dt') dataTable!: Table;

cols: { field: string; header: string }[] = [];

initCols(): void {
  this.cols = [
    { field: 'title', header: 'Título' },
    { field: 'content', header: 'Contenido' },

    { field: 'tagName', header: 'Categoría' },
    { field: 'operatorName', header: 'Operador' },
    { field: 'createdAt', header: 'Fecha' },
    { field: 'actions', header: 'Acciones' },
  ];
}


emitFiltersChanged(): void {
  this.gridViewFiltersChanged.emit({
    tagId: this.selectedTagId,
    operatorUserId: this.selectedOperatorId,
    createdAtFrom: this.rangeDates?.[0],
    createdAtTo: this.rangeDates?.[1],

  });
}

clearAllFilters(): void {
  this.rangeDates = [];
  this.selectedOperatorId = undefined;
  this.selectedTagId = undefined;

  this.gridViewFiltersChanged.emit({
    tagId: undefined,
    operatorUserId: undefined,
    createdAtFrom: undefined,
    createdAtTo: undefined,
  });

  this.dataTable.clear(); // limpia los filtros internos de PrimeNG
}

onCategoryChange() {
  this.gridViewFiltersChanged.emit({
    tagId: this.selectedTagId,
    createdAtFrom: this.rangeDates?.[0],
    createdAtTo: this.rangeDates?.[1],
  });
}

onDateChange() {
  
  this.gridViewFiltersChanged.emit({
    tagId: this.selectedTagId,
    createdAtFrom: this.rangeDates?.[0],
    createdAtTo: this.rangeDates?.[1],
  });
}

onCategoryChangeManually(value: string | undefined) {
  
  this.selectedTagId = value;
  this.emitFiltersChanged()

  // this.gridViewFiltersChanged.emit({
  //   tagId: value,
  //   createdAtFrom: this.rangeDates?.[0],
  //   createdAtTo: this.rangeDates?.[1],
  // });
}

onDateChangeManually(value: Date[] | undefined) {
  
  this.rangeDates = value;
  this.emitFiltersChanged()

  // this.gridViewFiltersChanged.emit({
  //   tagId: this.selectedTagId,
  //   createdAtFrom: value?.[0],
  //   createdAtTo: value?.[1],
  // });
}
onOperatorChangeManually(value: string | null | undefined): void {
  this.selectedOperatorId = value ?? undefined;
  this.emitFiltersChanged();
}



onClearCategory(): void {
  
  this.selectedTagId = undefined;
  this.emitFiltersChanged();
  // this.gridViewFiltersChanged.emit({
  //   tagId: undefined,
  //   createdAtFrom: this.rangeDates?.[0],
  //   createdAtTo: this.rangeDates?.[1],
  // });
}

onClearDateRange(): void {

  this.rangeDates = [];
  this.emitFiltersChanged();
  // this.gridViewFiltersChanged.emit({
  //   tagId: this.selectedTagId,
  //   createdAtFrom: undefined,
  //   createdAtTo: undefined,
  // });
}

onClearOperator(): void {
  this.selectedOperatorId = undefined;
  this.emitFiltersChanged();
}



  ngOnInit(): void {
    this.initCols();
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
