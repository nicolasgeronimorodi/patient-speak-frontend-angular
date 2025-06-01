
// ViewModel para listar transcripciones (versión simplificada)
export interface TranscriptionListItemViewModel {
  id: string;
  title: string;
  language: string;
  content: string;
  createdAt: Date;
  tagName?: string | null;
}