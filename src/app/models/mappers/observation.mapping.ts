import { ObservationViewModel } from "../view-models/observation.view.model";

export class ObservationMappers {

  static toViewModel(raw: any): ObservationViewModel {
    return {
      id: raw.id,
      content: raw.content,
      createdAt: raw.created_at,
      transcriptionId: raw.transcription_id,
      createdBy: raw.created_by,
      createdByName: raw.profile?.full_name ?? '-'
    };
  }

  static toViewModelList(data: any[]): ObservationViewModel[] {
  return data.map(ObservationMappers.toViewModel);
}

}