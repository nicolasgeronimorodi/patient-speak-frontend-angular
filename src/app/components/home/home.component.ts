import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TranscriptionNewComponent } from '../speech-to-text/transcription-new.component';
import { DatePipe, CommonModule } from '@angular/common';

import { TranscriptionService } from '../../services/transcription.service';
// import { TranscriptionFormModel, TranscriptionListItem } from '../../models/transcription-view-models';


import { PanelModule } from 'primeng/panel';
import {DropdownModule} from 'primeng/dropdown';
//import { TranscriptionListItemViewModel } from '../../models/view-models/transcription-list-item.view.model';
import { TranscriptionListItemViewModel } from '../../models/view-models/transcription-list-item.view.model';
import { TranscriptionFormViewModel } from '../../models/view-models/transcription-form.view.model';
@Component({
    selector: 'app-home',
    imports: [CommonModule, TranscriptionNewComponent, DatePipe, PanelModule, DropdownModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent  {

  recognizedText: string = '';
  currentLanguage: string = 'es-ES';
  savedTranscriptions: TranscriptionListItemViewModel[] = [];
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

    const formModel: TranscriptionFormViewModel = {
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
