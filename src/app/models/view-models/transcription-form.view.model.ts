// ViewModel para crear/editar transcripciones
export interface TranscriptionFormModel {
  title: string;
  content: string;
  language: string;
  isPublic?: boolean;
}
