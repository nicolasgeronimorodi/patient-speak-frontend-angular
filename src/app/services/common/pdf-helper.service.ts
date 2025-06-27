import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfHelperService {

  constructor() { }

generateSimplePdf(options: {
  filename: string;
  title: string;
  fields: { label: string; value?: string }[];
  extraSections?: {
    sectionTitle: string;
    fields: { label: string; value?: string }[];
  }[];
  longTextFieldLabel?: string;
  longText?: string;
}): void {
  const doc = new jsPDF();

  let y = 20;
  doc.setFontSize(16);
  doc.text(options.title, 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  options.fields.forEach((field) => {
    doc.text(`${field.label}: ${field.value ?? '-'}`, 14, y);
    y += 8;
  });

  if (options.extraSections) {
    options.extraSections.forEach((section) => {
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(section.sectionTitle, 14, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      section.fields.forEach((field) => {
        doc.text(`${field.label}: ${field.value ?? '-'}`, 20, y);
        y += 8;
      });
    });
  }

  if (options.longText && options.longTextFieldLabel) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`${options.longTextFieldLabel}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    const lines = doc.splitTextToSize(options.longText, 180);
    doc.text(lines, 14, y);
  }

  doc.save(options.filename);
}
}
