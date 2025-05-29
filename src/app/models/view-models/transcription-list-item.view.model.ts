import { Transcription } from "../database-models/transcription/transcription.interface";

// ViewModel para listar transcripciones (versión simplificada)
export interface TranscriptionListItem {
  id: string;
  title: string;
  language: string;
  content: string;
  createdAt: Date;
}