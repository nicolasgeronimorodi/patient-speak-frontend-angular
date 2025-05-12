import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SpeechToTextComponent } from '../speech-to-text/speech-to-text.component';
import { DatePipe, CommonModule } from '@angular/common';
import { Transcription } from '../../models';
import { TranscriptionService } from '../../services/transcription.service';
import { TranscriptionFormModel, TranscriptionListItem } from '../../models/transcription-view-models';



@Component({
    selector: 'app-home',
    imports: [CommonModule, SpeechToTextComponent, DatePipe],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

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
  
  ngOnInit(): void {
    this.loadTranscriptions();
  }

  loadTranscriptions(): void {
    this.isLoading = true;
    this.loadingTranscriptionsErrorMessage = null;
   
    this.transcriptionService.getUserTranscriptions().subscribe({
      next: (data) => {
        this.savedTranscriptions = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.loadingTranscriptionsErrorMessage = error.message;
        this.isLoading = false;
        console.error('Error loading transcriptions:', error);
      }
    });
  }
  

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
        this.loadTranscriptions(); // Recargar la lista después de guardar
      },
      error: (error) => {
        this.isSaving = false;
        this.saveTranscriptionErrorMessage = error.message;
        console.error('Error saving transcription:', error);
      }
    });
  }


  

}
