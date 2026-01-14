import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Subject, takeUntil } from 'rxjs';
import { SpeechToTextServiceFacadeService } from '../../services/speech-to-text/speech-to-text-facade.service';
import { TranscriptionFormViewModel } from '../../models/view-models/transcription-form.view.model';
import { TagService } from '../../services/tag.service';
import { TranscriptionService } from '../../services/transcription.service';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { ToastService } from '../../services/toast.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
    selector: 'app-transcription-new',
    imports: [CommonModule, ReactiveFormsModule, DropdownModule],
    templateUrl: './transcription-new.component.html',
    styleUrl: './transcription-new.component.css'
})
export class TranscriptionNewComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isListening = false;
  isProcessing = false;
  error: string | null = null;
  isSupported = true;

  tags: CreateTagResponse[] = [];
  isLoadingTags = false;
  isSaving = false;
  saveError: string | null = null;

  private destroy$ = new Subject<void>();

  languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English (US)' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  defaultLanguage: string = 'es';

  constructor(
    private fb: FormBuilder,
    private speechService: SpeechToTextServiceFacadeService,
    private tagService: TagService,
    private transcriptionService: TranscriptionService,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.form = this.fb.group({
      text: ['', Validators.required],
      tag_id: [null, Validators.required],
      language: ['']
    });
  }

  ngOnInit(): void {
    // Set breadcrumbs
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Nueva Transcripción', route: null, icon: 'add_circle_outline' }
    ]);

    this.isSupported = this.speechService.isSupported();

    this.loadTags();

    this.speechService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isListening = state.isListening;
        this.isProcessing = state.isProcessing;
        this.error = state.error;
        this.form.get('text')?.setValue(state.text, { emitEvent: false });
      });
  }

  loadTags(): void {
    this.isLoadingTags = true;
    this.tagService.getAllGlobalTags().subscribe({
      next: tags => {
        this.tags = tags;
        this.isLoadingTags = false;
      },
      error: err => {
        this.isLoadingTags = false;
        this.error = err.message || 'No se pudieron cargar las categorías.';
      }
    });
  }

  startListening(): void {
    this.speechService.startListening({
      language: this.defaultLanguage
    });
  }

  stopListening(): void {
    this.speechService.stopListening();
  }

  resetText(): void {
    this.speechService.resetText();
    this.form.get('text')?.setValue('');
  }

save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { text, tag_id, language } = this.form.value;

  this.isSaving = true;
  this.saveError = null;

  const payload: TranscriptionFormViewModel = {
    content: text,
    tag_id,
    language,
    title: '',
  };

  this.transcriptionService.saveTranscription(payload).subscribe({
    next: () => {
      this.isSaving = false;
      this.form.reset({ text: '', tag_id: null, language });
      this.speechService.resetText();
      this.toastService.showSuccess('Éxito:','Transcripción guardada correctamente.');
    
    },
    error: (err) => {
      this.isSaving = false;

      this.toastService.showError('Error:', 'Error al guardar la transcripción.');
    }
  });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.speechService.stopListening();
    this.breadcrumbService.clear();
  }
}