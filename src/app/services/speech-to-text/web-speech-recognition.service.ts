import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISpeechToTextService, SpeechServiceState, SpeechRecognitionOptions } from './speech-to-text.interface';

@Injectable()
export class WebSpeechRecognitionService implements ISpeechToTextService {

  private recognition: any;
  private accumulatedText: string = '';
  private stateSubject = new BehaviorSubject<SpeechServiceState>({
    isListening: false,
    isProcessing: false,
    text: '',
    error: null,
    implementation: 'web-speech'
  });

  public state$ = this.stateSubject.asObservable();

  constructor() {}

  public startListening(options: SpeechRecognitionOptions = {}): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition ||
                             (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.updateState({ error: 'Speech Recognition API not supported in this browser' });
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.lang = options.language ?? 'es-ES';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');

      const fullText = this.accumulatedText
        ? this.accumulatedText + ' ' + transcript
        : transcript;

      this.updateState({ text: fullText });
    };

    this.recognition.onerror = (event: any) => {
      this.updateState({ error: event.error, isListening: false, isProcessing: false });
    };

    this.recognition.onend = () => {
      if (this.stateSubject.value.isListening) {
        // Timeout del API, reiniciar
        this.recognition.start();
      } else if (this.stateSubject.value.isProcessing) {
        // Stop manual, consolidar texto
        this.accumulatedText = this.stateSubject.value.text;
        this.updateState({ isProcessing: false });
        this.recognition = null;
      }
    };

    try {
      this.recognition.start();
      this.updateState({ isListening: true, isProcessing: false, error: null });
    } catch (err) {
      this.updateState({ error: err instanceof Error ? err.message : String(err) });
    }
  }

  public stopListening(): void {
    if (this.recognition && this.stateSubject.value.isListening) {
      this.updateState({ isListening: false, isProcessing: true });
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return (typeof window !== 'undefined') &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) !== undefined;
  }

  public resetText(): void {
    this.accumulatedText = '';
    this.updateState({ text: '' });
  }

  private updateState(partialState: Partial<SpeechServiceState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partialState
    });
  }
}
