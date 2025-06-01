import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { WebSpeechRecognitionService } from './services/speech-to-text/web-speech-recognition.service';
import { WhisperRecognitionService } from './services/speech-to-text/whisper-recognition.service';
import { provideHttpClient } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import {providePrimeNG} from 'primeng/config'
import Aura from '@primeng/themes/aura';
import { DarkPreset, MyPreset } from '../styles';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(), WebSpeechRecognitionService, WhisperRecognitionService, provideAnimations(), providePrimeNG({theme: {preset: DarkPreset, options: {darkModeSelector: '.app-dark'}}}), MessageService  ]
};
