export interface PatientFormViewModel {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string | null;
  consentGiven: boolean;
}
