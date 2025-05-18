import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SpeechToTextComponent } from '../speech-to-text/speech-to-text.component';
import { DatePipe, CommonModule } from '@angular/common';

import { TranscriptionService } from '../../services/transcription.service';
import { TranscriptionFormModel, TranscriptionListItem } from '../../models/transcription-view-models';


import { PanelModule } from 'primeng/panel';
import {DropdownModule} from 'primeng/dropdown';

@Component({
    selector: 'app-home',
    imports: [CommonModule, SpeechToTextComponent, DatePipe, PanelModule, DropdownModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent  {

  recognizedText: string = '';
  currentLanguage: string = 'es-ES';
  savedTranscriptions: TranscriptionListItem[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  loadingTranscriptionsErrorMessage: string | null = null;
  saveTranscriptionErrorMessage: string | null = null;
  
  constructor(
    private authService: AuthService,
    private transcriptionService: TranscriptionService,
    private router: Router
  ) {}
  

  onTextChange(text: string): void {
    this.recognizedText = text;
  }
  
  onLanguageChange(language: any): void {
    this.currentLanguage = language;
  }
  
  saveText(): void {
    if (!this.recognizedText.trim()) return;
   
    this.isSaving = true;
    this.saveTranscriptionErrorMessage = null;

    const formModel: TranscriptionFormModel = {
      content: this.recognizedText,
      language: this.currentLanguage,
      title: '' //Generated in service
    };
   
    this.transcriptionService.saveTranscription(
    formModel
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.recognizedText = '';
      },
      error: (error) => {
        this.isSaving = false;
        this.saveTranscriptionErrorMessage = error.message;
        console.error('Error saving transcription:', error);
      }
    });
  }


  

}
