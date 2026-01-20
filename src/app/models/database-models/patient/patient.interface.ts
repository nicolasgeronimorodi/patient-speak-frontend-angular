export interface PatientEntity {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string | null;
  consent_given: boolean;
  consent_date: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
