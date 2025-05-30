import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Textarea } from 'primeng/inputtextarea';
import { Subject, takeUntil } from 'rxjs';
import { SpeechToTextServiceFacadeService } from '../../services/speech-to-text/speech-to-text-facade.service';


@Component({
    selector: 'app-transcription-new',
    imports: [CommonModule, FormsModule, DropdownModule, Textarea],
    templateUrl: './transcription-new.component.html',
    styleUrl: './transcription-new.component.css'
})
export class TranscriptionNewComponent implements OnDestroy {
  
  @Input() language: string = 'es';
  @Output() textChange = new EventEmitter<string>();

  text: string = '';
  isListening: boolean = false;
  error: string | null = null;
  isSupported: boolean = true;

  private destroy$ = new Subject<void>();
  
  languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English (US)' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  constructor(private speechService: SpeechToTextServiceFacadeService){
    this.isSupported = this.speechService.isSupported();

    this.speechService.text$
      .pipe(takeUntil(this.destroy$))
      .subscribe(text => {
        this.text = text;
        this.textChange.emit(text);
      });

    this.speechService.isListening$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isListening => {
        this.isListening = isListening;
      });

      this.speechService.error$
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => {
          this.error = error;
        })
  }

  onLanguageChange(newLanguage: string): void {
    this.language = newLanguage;
    if(this.isListening){
      this.speechService.stopListening();
      this.speechService.startListening({language: this.language});
    }
  }

  startListening():void{
    this.speechService.startListening({language: this.language})
  }

  stopListening():void{
    this.speechService.stopListening();
  }

  resetText():void{
    this.speechService.resetText();
  }

  ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
   this.speechService.stopListening();
  }
}
