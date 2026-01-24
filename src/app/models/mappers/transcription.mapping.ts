import { TranscriptionEntity } from '../database-models/transcription/transcription.interface';
import { TranscriptionFormViewModel } from '../view-models/transcription-form.view.model';
import { TranscriptionDetailViewModel } from "../view-models/transcription-detail.view.model";
import { TranscriptionListItemViewModel } from "../view-models/transcription-list-item.view.model";

// Mappers para convertir entre modelos
export class TranscriptionMappers {
  // Convierte modelo DB a ViewModel para listado
  static toListItem(transcription: TranscriptionEntity): TranscriptionListItemViewModel {
    return {
      id: transcription.id,
      consultationReason: transcription.consultation_reason,
      content: transcription.content,
      language: transcription.language,
      createdAt: new Date(transcription.created_at || ''),
      tagName: transcription.tag?.name || undefined
    };
  }

  // Convierte modelo DB a ViewModel para detalle
  static toDetail(transcription: TranscriptionEntity): TranscriptionDetailViewModel {
    return {
      id: transcription.id,
      consultationReason: transcription.consultation_reason,
      userId: transcription.user_id,
      content: transcription.content,
      language: transcription.language,
      createdAt: new Date(transcription.created_at || ''),
      updatedAt: new Date(transcription.updated_at || ''),
      audioUrl: transcription.audio_url,
      duration: transcription.duration,
      tagName: transcription.tag?.name || undefined
    };
  }

  // Convierte ViewModel de formulario a modelo DB para crear/actualizar
  static fromForm(formModel: TranscriptionFormViewModel): Partial<TranscriptionEntity> {
    return {
      consultation_reason: formModel.consultationReason,
      content: formModel.content,
      language: formModel.language,
      tag_id: formModel.tag_id ?? null,
      patient_id: formModel.patient_id
    };
  }
}