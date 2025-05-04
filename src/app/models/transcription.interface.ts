export interface Transcription {
    id: string;
    user_id: string;
    title: string;
    content: string;
    language: string;
    audio_url?: string;
    duration?: number;
    is_public?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface CreateTranscriptionRequest {
    content: string;
    language: string;
    title?: string;
    audio_url?: string;
    duration?: number;
    is_public?: boolean;
  }