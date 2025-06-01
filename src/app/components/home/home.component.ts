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
import { TagService } from '../../services/tag.service';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule, TranscriptionNewComponent, DatePipe, PanelModule, DropdownModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  recognizedText: string = '';
  currentLanguage: string = 'es-ES';

  tags: CreateTagResponse[] = [];
  selectedTagId: string | null = null;
  loadingTagsError: string | null = null;
  

  
  isLoading: boolean = false;
  isSaving: boolean = false;
  
  loadingTranscriptionsErrorMessage: string | null = null;
  saveTranscriptionErrorMessage: string | null = null;
  
  constructor(
    private tagService: TagService,
    private transcriptionService: TranscriptionService,

  ) {}


  ngOnInit(): void {
    this.getAvailableGlobalTags();
  }

  getAvailableGlobalTags(): void{
    this.tagService.getAllGlobalTags().subscribe({
      next: (tags) => this.tags = tags,
      error: (error) => this.loadingTagsError = error.message
    })
  }
  

  onTextChange(text: string): void {
    this.recognizedText = text;
  }
  
  onLanguageChange(language: any): void {
    this.currentLanguage = language;
  }


  
  saveText(): void {
     if (!this.recognizedText.trim() || !this.selectedTagId) return;
   
    this.isSaving = true;
    this.saveTranscriptionErrorMessage = null;

    const formModel: TranscriptionFormViewModel = {
      content: this.recognizedText,
      language: this.currentLanguage,
      title: '',
      tag_id: this.selectedTagId,
    };
   
    this.transcriptionService.saveTranscription(
    formModel
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.recognizedText = '';
        this.selectedTagId = null;
      },
      error: (error) => {
        this.isSaving = false;
        this.saveTranscriptionErrorMessage = error.message;
        console.error('Error saving transcription:', error);
      }
    });
  }


  

}
