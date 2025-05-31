export interface CreateTranscriptionRequest {
    content: string;
    language: string;
    title?: string;
    audio_url?: string;
    duration?: number;
  }