import { Observable } from 'rxjs';

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface WhisperRecognitionOptions {
  language?: string;
}

export type RecognitionOptions = SpeechRecognitionOptions | WhisperRecognitionOptions;

export interface SpeechServiceState {
  isListening: boolean;
  isProcessing: boolean;
  text: string;
  error: string | null;
  implementation: 'web-speech' | 'whisper';
}

export interface ISpeechToTextService {
  state$: Observable<SpeechServiceState>;
  
  startListening(options?: RecognitionOptions): void;
  stopListening(): void;
  resetText(): void;
  isSupported(): boolean;
}