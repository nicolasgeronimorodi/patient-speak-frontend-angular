// src/app/services/speech-to-text.service.ts
import { Injectable } from '@angular/core';
import { ISpeechToTextService, RecognitionOptions, SpeechServiceState, SpeechRecognitionOptions } from './speech-to-text.interface';
import { WebSpeechRecognitionService } from './web-speech-recognition.service';
import { WhisperRecognitionService } from './whisper-recognition.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class SpeechToTextServiceFacadeService implements ISpeechToTextService {
  private service: ISpeechToTextService;

  constructor(
    private webSpeechService: WebSpeechRecognitionService,
    private whisperService: WhisperRecognitionService
  ) {
    // Decide qué implementación usar basándose en configuración o disponibilidad
    const useWhisper = environment.useWhisperAPI === true;
    
    if (useWhisper) {
      this.service = this.whisperService;
    } else {
      // Usar Web Speech API si está disponible, de lo contrario usar Whisper
      this.service = this.webSpeechService.isSupported() ? 
                    this.webSpeechService : 
                    this.whisperService;
    }
  }

  get state$(): Observable<SpeechServiceState> {
    return this.service.state$;
  }

  public startListening(options: RecognitionOptions = {}): void {
    this.service.startListening(options);
  }

  public stopListening(): void {
    this.service.stopListening();
  }

  public resetText(): void {
    this.service.resetText();
  }

  public isSupported(): boolean {
    return this.service.isSupported();
  }
}