
// ViewModel para listar transcripciones (version simplificada)
export interface TranscriptionListItemViewModel {
  id: string;
  consultationReason: string;
  content: string;
  createdAt: Date;
  tagName?: string | null;
}