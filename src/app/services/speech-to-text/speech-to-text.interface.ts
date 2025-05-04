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


export interface ISpeechToTextService {
  isListening$: Observable<boolean>;
  text$: Observable<string>;
  error$: Observable<string | null>;
  
  startListening(options?: RecognitionOptions): void;
  stopListening(): void;
  resetText(): void;
  isSupported(): boolean;
}