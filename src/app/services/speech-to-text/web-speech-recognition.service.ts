import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISpeechToTextService, SpeechServiceState, SpeechRecognitionOptions } from './speech-to-text.interface';


@Injectable({
  providedIn: 'root'
})
export class WebSpeechRecognitionService implements ISpeechToTextService {

  private recognition: any;
  private accumulatedText: string = '';
  private sessionFinalText: string = '';
  private isStopping: boolean = false;
  private stateSubject = new BehaviorSubject<SpeechServiceState>({
    isListening: false,
    isProcessing: false,
    text: '',
    error: null,
    implementation: 'web-speech'
  });

  public state$ = this.stateSubject.asObservable();
  
  private initRecognition(options: SpeechRecognitionOptions = {}) {
    if (typeof window === 'undefined') return;

    // Browser compatibility check
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.updateState({ error: 'Speech Recognition API not supported in this browser' });
      return;
    }

    // Cleanup previous instance if exists
    if (this.recognition) {
      this.isStopping = true;
      this.recognition.stop();
    }

    // Create new instance
    this.recognition = new SpeechRecognition();
    this.sessionFinalText = '';
    this.isStopping = false;
    
    // Configure recognition
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.lang = options.language ?? 'es-ES';
    
    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      if (this.isStopping) return;

      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      this.sessionFinalText = finalText.trim();
      const parts = [this.accumulatedText, this.sessionFinalText, interimText].filter(p => p);
      this.updateState({ text: parts.join(' ') });
    };
    
    this.recognition.onerror = (event: any) => {
      this.updateState({ error: event.error, isListening: false });
    };
    
    this.recognition.onend = () => {
      // Auto restart if still listening (handles timeouts)
      if (this.stateSubject.value.isListening) {
        this.recognition.start();
      } else {
        this.updateState({ isListening: false });
      }
    };
  }
  

  public startListening(options: SpeechRecognitionOptions = {}): void {
    this.initRecognition(options);
    
    try {
      this.recognition.start();
      this.updateState({ isListening: true, error: null });
    } catch (err) {
      this.updateState({ error: err instanceof Error ? err.message : String(err) });
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.isStopping = true;
      this.recognition.stop();
      const parts = [this.accumulatedText, this.sessionFinalText].filter(p => p);
      this.accumulatedText = parts.join(' ');
      this.sessionFinalText = '';
      this.updateState({ isListening: false });
    }
  }


  public isSupported(): boolean {
    return (typeof window !== 'undefined') && 
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) !== undefined;
  }

  public resetText(): void {
    this.accumulatedText = '';
    this.sessionFinalText = '';
    this.updateState({ text: '' });
  }

  private updateState(partialState: Partial<SpeechServiceState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partialState
    });
  }



  constructor() { this.initRecognition(); }
}
