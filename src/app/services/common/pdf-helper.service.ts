import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfHelperService {

  constructor() { }

   generateSimplePdf(params: {
    filename: string;
    title: string;
    fields: { label: string; value: string | null | undefined }[];
    longTextFieldLabel?: string;
    longText?: string;
  }): void {
    const doc = new jsPDF();
    const margin = 10;
    let y = margin;

    doc.setFontSize(16);
    doc.text(params.title, margin, y);
    y += 10;

    doc.setFontSize(12);
    for (const field of params.fields) {
      const text = `${field.label}: ${field.value || '-'}`;
      doc.text(text, margin, y);
      y += 8;
    }

    if (params.longText) {
      y += 5;
      doc.setFontSize(13);
      doc.text(params.longTextFieldLabel || 'Contenido:', margin, y);
      y += 8;

      doc.setFontSize(11);
      const lines = doc.splitTextToSize(params.longText, 180);
      doc.text(lines, margin, y);
    }

    doc.save(params.filename);
  }
}
