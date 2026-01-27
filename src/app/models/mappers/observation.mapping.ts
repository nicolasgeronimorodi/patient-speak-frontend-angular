import { ObservationViewModel } from "../view-models/observation.view.model";

export class ObservationMappers {
  static toViewModel(raw: any): ObservationViewModel {
    return {
      id: raw.id,
      content: raw.content,
      createdAt: raw.created_at,
      transcriptionId: raw.transcription_id,
      createdBy: raw.user_id,
      createdByName: raw.profiles?.full_name || undefined
    };
  }
  static toViewModelList(data: any[]): ObservationViewModel[] {
  return data.map(ObservationMappers.toViewModel);
}

}