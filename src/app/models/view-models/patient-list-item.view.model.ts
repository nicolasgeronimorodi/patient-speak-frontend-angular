export interface PatientListItemViewModel {
  id: string;
  fullName: string;
  documentTypeId: number;
  documentTypeName: string;
  documentNumber: string | null;
  createdAt: Date;
}
