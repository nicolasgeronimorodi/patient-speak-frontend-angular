import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISpeechToTextService } from './speech-to-text.interface';


export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class WebSpeechRecognitionService implements ISpeechToTextService {

  private recognition: any;
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  private textSubject = new BehaviorSubject<string>('');
  private errorSubject = new BehaviorSubject<string | null>(null);

  public isListening$ = this.isListeningSubject.asObservable();
  public text$ = this.textSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  
  private initRecognition(options: SpeechRecognitionOptions = {}) {
    if (typeof window === 'undefined') return;

    // Browser compatibility check
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.errorSubject.next('Speech Recognition API not supported in this browser');
      return;
    }

    // Cleanup previous instance if exists
    if (this.recognition) {
      this.recognition.stop();
    }

    // Create new instance
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.lang = options.language ?? 'es-ES';
    
    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      
      this.textSubject.next(transcript);
    };
    
    this.recognition.onerror = (event: any) => {
      this.errorSubject.next(event.error);
    };
    
    this.recognition.onend = () => {
      // Auto restart if still listening (handles timeouts)
      if (this.isListeningSubject.value) {
        this.recognition.start();
      } else {
        this.isListeningSubject.next(false);
      }
    };
  }
  

  public startListening(options: SpeechRecognitionOptions = {}): void {
    this.initRecognition(options);
    
    try {
      this.recognition.start();
      this.isListeningSubject.next(true);
      this.errorSubject.next(null);
    } catch (err) {
      this.errorSubject.next(err instanceof Error ? err.message : String(err));
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListeningSubject.next(false);
    }
  }


  public isSupported(): boolean {
    return (typeof window !== 'undefined') && 
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) !== undefined;
  }

  public resetText(): void {
    this.textSubject.next('');
  }



  constructor() { this.initRecognition(); }
}
