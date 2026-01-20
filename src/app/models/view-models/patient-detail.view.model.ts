export interface PatientDetailViewModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: string;
  documentNumber: string | null;
  consentGiven: boolean;
  consentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
