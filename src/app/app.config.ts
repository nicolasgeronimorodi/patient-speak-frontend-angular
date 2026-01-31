import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { WebSpeechRecognitionService } from './services/speech-to-text/web-speech-recognition.service';
import { WhisperRecognitionService } from './services/speech-to-text/whisper-recognition.service';
import { provideHttpClient } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import {providePrimeNG} from 'primeng/config'
import Aura from '@primeng/themes/aura';
import { DarkPreset, MyPreset } from '../styles';
import { MessageService } from 'primeng/api';

registerLocaleData(localeEs, 'es');

const spanishTranslation = {
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
  dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sem',
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    WebSpeechRecognitionService,
    WhisperRecognitionService,
    provideAnimations(),
    providePrimeNG({
      theme: { preset: DarkPreset, options: { darkModeSelector: '.app-dark' } },
      translation: spanishTranslation
    }),
    MessageService,
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};
