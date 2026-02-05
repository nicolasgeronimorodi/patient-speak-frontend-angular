import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-transcriptions-query-grid-view',
  imports: [
    DatePipe,
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
  @Output() delete = new EventEmitter<string>();

  totalItems = 0;

  ngOnInit(): void {
    this.totalItems$.subscribe((value) => {
      this.totalItems = value;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
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

  /**
   * Exporta las transcripciones de la pagina actual a un archivo Excel (.xlsx).
   * Mapea los datos del modelo a columnas con nombres legibles y genera la descarga.
   */
  exportToExcel(): void {
    const data = this.transcriptions.map((item) => ({
      'Motivo de consulta': item.consultationReason,
      'Contenido': item.content,
      'Paciente': item.patientFullName || '-',
      'Categoria': item.tagName || '-',
      'Fecha': this.formatDate(item.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transcripciones');
    XLSX.writeFile(workbook, `transcripciones_${this.getTimestamp()}.xlsx`);
  }

  /**
   * Exporta las transcripciones de la pagina actual a un archivo PDF.
   * Utiliza jspdf-autotable para generar una tabla formateada con los datos.
   */
  exportToPdf(): void {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Transcripciones', 14, 20);

    const tableData = this.transcriptions.map((item) => [
      item.consultationReason,
      this.truncate(item.content, 50),
      item.patientFullName || '-',
      item.tagName || '-',
      this.formatDate(item.createdAt),
    ]);

    autoTable(doc, {
      head: [['Motivo de consulta', 'Contenido', 'Paciente', 'Categoría', 'Fecha']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`transcripciones_${this.getTimestamp()}.pdf`);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private getTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  }
}
