// ViewModel para mostrar una transcripción en detalle
export interface TranscriptionDetailViewModel {
  id: string;
  userId: string;
  title: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  audioUrl?: string;
  duration?: number;
  tagName?: string;
}
