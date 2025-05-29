export interface ObservationViewModel {
  id: string;
  content: string;
  createdAt: string;
  transcriptionId: string;
  createdBy: string;
  createdByName?: string; // opcional si está disponible
}