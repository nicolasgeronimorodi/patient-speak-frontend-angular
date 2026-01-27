export interface CreateTranscriptionRequest {
    content: string;
    title?: string;
    audio_url?: string;
    duration?: number;
  }