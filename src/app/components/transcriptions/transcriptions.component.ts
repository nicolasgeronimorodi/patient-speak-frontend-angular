import { Component, OnInit } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { TranscriptionListItem } from '../../models/transcription-view-models';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-transcriptions',
  imports: [CommonModule, CardModule],
  templateUrl: './transcriptions.component.html',
  styleUrl: './transcriptions.component.css'
})
export class TranscriptionsComponent implements OnInit {


  loadingTranscriptionsErrorMessage: string | null = null;
  isLoading: boolean = false;
  savedTranscriptions: TranscriptionListItem[] = [];
  

  constructor(
       private readonly transcriptionService: TranscriptionService,
  ){ }

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
    
  


  

}
