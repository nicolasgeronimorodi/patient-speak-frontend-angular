export interface PatientFormViewModel {
  firstName: string;
  lastName: string;
  documentTypeId: number;
  documentNumber: string | null;
  consentGiven: boolean;
}
