import { TranscriptionEntity } from '../database-models/transcription/transcription.interface';
import { TranscriptionFormViewModel } from '../view-models/transcription-form.view.model';
import { TranscriptionDetailViewModel } from '../view-models/transcription-detail.view.model';
import { TranscriptionListItemViewModel } from '../view-models/transcription-list-item.view.model';
import { format, parseISO } from 'date-fns';

// Mappers para convertir entre modelos
export class TranscriptionMappers {
  // Convierte modelo DB a ViewModel para listado

  // static toListItem(entity: any): TranscriptionListItemViewModel {
  //   const createdAtLocal = entity.created_at
  //     ? format(parseISO(entity.created_at), 'dd-MM-yyyy HH:mm')
  //     : '';

  //   return {
  //     id: entity.id,
  //     title: entity.title,
  //     content: entity.content,
  //     language: entity.language,
  //     tagName: entity.tag?.name || null,
  //     createdAt: createdAtLocal,
  //     // operatorName: entity.profile?.full_name || null,
  //     operatorName:  entity.profile?.full_name?.trim() || [entity.profile?.first_name, entity.profile?.last_name].filter(Boolean).join(' ').trim() || '-'
  //   };
  // }

  //   static toListItem(entity: any): TranscriptionListItemViewModel {
  //   const createdAtLocal = entity.created_at
  //     ? format(parseISO(entity.created_at), 'dd-MM-yyyy HH:mm')
  //     : '';

  //   const fullName = entity.profile?.full_name || entity.profile_full_name;
  //   const firstName = entity.profile?.first_name || entity.profile_first_name;
  //   const lastName = entity.profile?.last_name || entity.profile_last_name;

  //   return {
  //     id: entity.id,
  //     title: entity.title,
  //     content: entity.content,
  //     language: entity.language,
  //     tagName: entity.tag?.name || null,
  //     createdAt: createdAtLocal,
  //     operatorName: fullName?.trim() || [firstName, lastName].filter(Boolean).join(' ').trim() || '-',
  //   };
  // }

  static toListItem(entity: any): TranscriptionListItemViewModel {
    const createdAtLocal = entity.created_at
      ? format(parseISO(entity.created_at), 'dd-MM-yyyy HH:mm')
      : '';

    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      language: entity.language,
      tagName: entity.tag?.name || entity.tag_name || '-',
      createdAt: createdAtLocal,
      operatorName:
        entity.operator_full_name?.trim() ||
        [entity.profile?.first_name, entity.profile?.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        entity.profile?.full_name?.trim() ||
        '-',
    };
  }

  // Convierte modelo DB a ViewModel para detalle
  static toDetail(
    transcription: TranscriptionEntity
  ): TranscriptionDetailViewModel {
    return {
      id: transcription.id,
      title: transcription.title,
      userId: transcription.user_id,
      content: transcription.content,
      language: transcription.language,
      createdAt: new Date(transcription.created_at || ''),
      updatedAt: new Date(transcription.updated_at || ''),
      audioUrl: transcription.audio_url,
      duration: transcription.duration,
      tagName: transcription.tag?.name || undefined,
    };
  }

  // Convierte ViewModel de formulario a modelo DB para crear/actualizar
  static fromForm(
    formModel: TranscriptionFormViewModel
  ): Partial<TranscriptionEntity> {
    return {
      title: formModel.title,
      content: formModel.content,
      language: formModel.language,
      tag_id: formModel.tag_id ?? null,
    };
  }
}
