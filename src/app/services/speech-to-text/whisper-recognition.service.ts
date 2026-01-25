// src/app/services/whisper-recognition.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { ISpeechToTextService, SpeechServiceState, WhisperRecognitionOptions } from './speech-to-text.interface';
import { environment } from '../../../environments/environment';

@Injectable()
export class WhisperRecognitionService implements ISpeechToTextService {
  private stateSubject = new BehaviorSubject<SpeechServiceState>({
    isListening: false,
    isProcessing: false,
    text: '',
    error: null,
    implementation: 'whisper'
  });

  public state$ = this.stateSubject.asObservable();

  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private currentLanguage: string = 'es';

  constructor(private http: HttpClient) {}

  public startListening(options: WhisperRecognitionOptions = {}): void {
    if (this.stateSubject.value.isListening) {
      return;
    }

    this.currentLanguage = options.language || 'es';
    this.updateState({ error: null });
    this.audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.stream = stream;
        this.recorder = new MediaRecorder(stream);

        this.recorder.addEventListener('dataavailable', event => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        });

        this.recorder.start();
        this.updateState({ isListening: true });
      })
      .catch(error => {
        this.updateState({ error: 'Error al acceder al micrófono: ' + error.message });
      });
  }

  public stopListening(): void {
    if (!this.stateSubject.value.isListening || !this.recorder) {
      return;
    }

    this.updateState({ isListening: false });
    
    this.recorder.addEventListener('stop', () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.transcribeAudio(audioBlob, this.currentLanguage);
      this.cleanupRecording();
    });

    this.recorder.stop();
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' && 
           typeof navigator.mediaDevices.getUserMedia !== 'undefined';
  }

  public resetText(): void {
    this.updateState({ text: '' });
  }

  private cleanupRecording(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.recorder = null;
    this.audioChunks = [];
  }

  private transcribeAudio(audioBlob: Blob, language: string): void {
    if (!audioBlob || audioBlob.size === 0) {
      this.updateState({ error: 'No hay audio para transcribir' });
      return;
    }

    const apiKey = environment.openaiApiKey;
    if (!apiKey) {
      this.updateState({ error: 'API key de OpenAI no configurada' });
      return;
    }

    this.updateState({ isProcessing: true });

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    if (language) {
      formData.append('language', language);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`
    });

    this.http.post<any>(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      { headers }
    ).pipe(
      catchError(error => {
        this.updateState({ 
          error: 'Error al transcribir: ' + (error.error?.error?.message || error.message),
          isProcessing: false 
        });
        throw error;
      }),
      finalize(() => {
        this.updateState({ isProcessing: false });
      })
    ).subscribe(response => {
      const transcribedText = response.text || '';
      const currentText = this.stateSubject.value.text;
      const newText = currentText ? currentText + ' ' + transcribedText : transcribedText;
      this.updateState({ text: newText });
    });
  }

  private updateState(partialState: Partial<SpeechServiceState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partialState
    });
  }
}