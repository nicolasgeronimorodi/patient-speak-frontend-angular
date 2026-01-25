export interface PatientDetailViewModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentTypeId: number;
  documentTypeName: string;
  documentNumber: string | null;
  consentGiven: boolean;
  consentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
