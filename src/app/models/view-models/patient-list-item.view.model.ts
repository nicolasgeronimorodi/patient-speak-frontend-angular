export interface PatientListItemViewModel {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string | null;
  createdAt: Date;
}
