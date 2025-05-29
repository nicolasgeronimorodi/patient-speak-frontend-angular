import { Transcription } from '../database-models/transcription/transcription.interface';
import { TranscriptionFormModel } from '../view-models/transcription-form.view.model';
import { TranscriptionDetail } from "../view-models/transcription-detail.view.model";
import { TranscriptionListItem } from "../view-models/transcription-list-item.view.model";

// Mappers para convertir entre modelos
export class TranscriptionMappers {
  // Convierte modelo DB a ViewModel para listado
  static toListItem(transcription: Transcription): TranscriptionListItem {
    return {
      id: transcription.id,
      title: transcription.title,
      content: transcription.content,
      language: transcription.language,
      createdAt: new Date(transcription.created_at || '')
    };
  }
  
  // Convierte modelo DB a ViewModel para detalle
  static toDetail(transcription: Transcription): TranscriptionDetail {
    return {
      id: transcription.id,
      title: transcription.title,
      userId: transcription.user_id, 
      content: transcription.content,
      language: transcription.language,
      createdAt: new Date(transcription.created_at || ''),
      updatedAt: new Date(transcription.updated_at || ''),
      audioUrl: transcription.audio_url,
      duration: transcription.duration
    };
  }
  
  // Convierte ViewModel de formulario a modelo DB para crear/actualizar
  static fromForm(formModel: TranscriptionFormModel): Partial<Transcription> {
    return {
      title: formModel.title,
      content: formModel.content,
      language: formModel.language,
      is_public: formModel.isPublic
    };
  }
}