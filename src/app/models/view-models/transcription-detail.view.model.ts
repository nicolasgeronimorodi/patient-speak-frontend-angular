// ViewModel para mostrar una transcripcion en detalle
export interface TranscriptionDetailViewModel {
  id: string;
  userId: string;
  patientId: string;
  consultationReason: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  audioUrl?: string;
  duration?: number;
  tagName?: string;
}
