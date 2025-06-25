
// ViewModel para listar transcripciones (versión simplificada)
export interface TranscriptionListItemViewModel {
  id: string;
  title: string;
  language: string;
  content: string;
  createdAt: string;
  tagName?: string | null;
  operatorName?: string | null;
}