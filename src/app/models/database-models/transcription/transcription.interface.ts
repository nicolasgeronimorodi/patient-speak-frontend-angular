export interface TranscriptionEntity {
    id: string;
    user_id: string;
    consultation_reason: string;
    content: string;
    language: string;
    audio_url?: string;
    duration?: number;
    created_at?: string;
    updated_at?: string;
    tag_id?: string;
    tag?: {
      id: string;
      name: string;
    };
    tag_name?: string;
    patient_id: string;
  }
  