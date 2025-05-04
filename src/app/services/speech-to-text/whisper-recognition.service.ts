// src/app/services/whisper-recognition.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { ISpeechToTextService, SpeechRecognitionOptions, WhisperRecognitionOptions } from './speech-to-text.interface';
import { environment } from '../../../environments/environment';

@Injectable()
export class WhisperRecognitionService implements ISpeechToTextService {
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  private textSubject = new BehaviorSubject<string>('');
  private errorSubject = new BehaviorSubject<string | null>(null);
  private isProcessingSubject = new BehaviorSubject<boolean>(false);

  public isListening$ = this.isListeningSubject.asObservable();
  public text$ = this.textSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public isProcessing$ = this.isProcessingSubject.asObservable();

  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private currentLanguage: string = 'es';

  constructor(private http: HttpClient) {}

  public startListening(options: WhisperRecognitionOptions = {}): void {
    if (this.isListeningSubject.value) {
      return;
    }

    this.currentLanguage = options.language || 'es';
    this.errorSubject.next(null);
    this.textSubject.next('');
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
        this.isListeningSubject.next(true);
      })
      .catch(error => {
        this.errorSubject.next('Error al acceder al micrófono: ' + error.message);
      });
  }

  public stopListening(): void {
    if (!this.isListeningSubject.value || !this.recorder) {
      return;
    }

    this.isListeningSubject.next(false);
    
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
    this.textSubject.next('');
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
    debugger;
    if (!audioBlob || audioBlob.size === 0) {
      this.errorSubject.next('No hay audio para transcribir');
      return;
    }

    const apiKey = environment.openaiApiKey;
    if (!apiKey) {
      this.errorSubject.next('API key de OpenAI no configurada');
      return;
    }

    this.isProcessingSubject.next(true);

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
        this.errorSubject.next('Error al transcribir: ' + (error.error?.error?.message || error.message));
        this.isProcessingSubject.next(false);
        throw error;
      }),
      finalize(() => {
        this.isProcessingSubject.next(false);
      })
    ).subscribe(response => {
      const transcribedText = response.text || '';
      this.textSubject.next(transcribedText);
    });
  }
}