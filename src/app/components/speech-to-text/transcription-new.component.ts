import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { SpeechToTextServiceFacadeService } from '../../services/speech-to-text/speech-to-text-facade.service';
import { WebSpeechRecognitionService } from '../../services/speech-to-text/web-speech-recognition.service';
import { WhisperRecognitionService } from '../../services/speech-to-text/whisper-recognition.service';
import { TranscriptionFormViewModel } from '../../models/view-models/transcription-form.view.model';
import { TagService } from '../../services/tag.service';
import { TranscriptionService } from '../../services/transcription.service';
import { PatientService } from '../../services/patient.service';
import { DocumentTypeService } from '../../services/document-type.service';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { PatientListItemViewModel } from '../../models/view-models/patient-list-item.view.model';
import { PatientFormViewModel } from '../../models/view-models/patient-form.view.model';
import { DocumentTypeViewModel } from '../../models/view-models/document-type.view.model';
import { DocumentType } from '../../models/enums/document-type.enum';
import { DocumentValidator } from '../../validators/document-validator';
import { ToastService } from '../../services/toast.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-transcription-new',
    imports: [CommonModule, ReactiveFormsModule, DropdownModule, AutoCompleteModule, CheckboxModule, RouterModule],
    providers: [SpeechToTextServiceFacadeService, WebSpeechRecognitionService, WhisperRecognitionService],
    templateUrl: './transcription-new.component.html',
    styleUrl: './transcription-new.component.css'
})
export class TranscriptionNewComponent implements OnInit, OnDestroy {
  form: FormGroup;
  patientForm: FormGroup;

  isListening = false;
  isProcessing = false;
  error: string | null = null;
  isSupported = true;

  tags: CreateTagResponse[] = [];
  isLoadingTags = false;
  isSaving = false;
  saveError: string | null = null;

  // Patient selection
  patientMode: 'existing' | 'new' = 'existing';
  patientSuggestions: PatientListItemViewModel[] = [];
  selectedPatient: PatientListItemViewModel | null = null;
  isSearchingPatients = false;

  // Document types
  documentTypes: DocumentTypeViewModel[] = [];
  isLoadingDocumentTypes = false;
  documentValidationError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private speechService: SpeechToTextServiceFacadeService,
    private tagService: TagService,
    private transcriptionService: TranscriptionService,
    private patientService: PatientService,
    private documentTypeService: DocumentTypeService,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {
    this.form = this.fb.group({
      text: ['', Validators.required],
      consultationReason: ['', Validators.required],
      tag_id: [null, Validators.required],
      patientSearch: ['']
    });

    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentTypeId: [DocumentType.DNI],
      documentNumber: [''],
      consentGiven: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Nueva Transcripcion', route: null, icon: 'add_circle_outline' }
    ]);

    this.isSupported = this.speechService.isSupported();

    this.loadTags();
    this.loadDocumentTypes();
    this.setupDocumentValidation();

    this.speechService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isListening = state.isListening;
        this.isProcessing = state.isProcessing;
        this.error = state.error;
        this.form.get('text')?.setValue(state.text, { emitEvent: false });
      });
  }

  loadDocumentTypes(): void {
    this.isLoadingDocumentTypes = true;
    this.documentTypeService.getDocumentTypes().subscribe({
      next: (types) => {
        this.documentTypes = types;
        this.isLoadingDocumentTypes = false;
      },
      error: (err) => {
        this.isLoadingDocumentTypes = false;
        console.error('Error loading document types:', err);
      }
    });
  }

  /**
   * Sets up reactive validation for document number based on type selection.
   * Validates on both type change and number change.
   */
  setupDocumentValidation(): void {
    this.patientForm.get('documentTypeId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateDocument();
      });

    this.patientForm.get('documentNumber')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateDocument();
      });
  }

  validateDocument(): void {
    const documentTypeId = this.patientForm.get('documentTypeId')?.value;
    const documentNumber = this.patientForm.get('documentNumber')?.value;

    const result = DocumentValidator.validate(documentTypeId, documentNumber);
    this.documentValidationError = result?.message || null;
  }

  isDocumentValid(): boolean {
    return this.documentValidationError === null;
  }

  loadTags(): void {
    this.isLoadingTags = true;
    this.tagService.getTagsByFilter({ isGlobal: true, isValid: true }).subscribe({
      next: tags => {
        this.tags = tags;
        this.isLoadingTags = false;
      },
      error: err => {
        this.isLoadingTags = false;
        this.error = err.message || 'No se pudieron cargar las categorias.';
      }
    });
  }

  // Patient autocomplete
  searchPatients(event: AutoCompleteCompleteEvent): void {
    const query = event.query;
    if (!query || query.length < 2) {
      this.patientSuggestions = [];
      return;
    }

    this.isSearchingPatients = true;
    this.patientService.searchPatients(query).subscribe({
      next: (patients) => {
        this.patientSuggestions = patients;
        this.isSearchingPatients = false;
      },
      error: () => {
        this.patientSuggestions = [];
        this.isSearchingPatients = false;
      }
    });
  }

  onPatientSelect(event: AutoCompleteSelectEvent): void {
    this.selectedPatient = event.value as PatientListItemViewModel;
  }

  clearPatientSelection(): void {
    this.selectedPatient = null;
    this.form.get('patientSearch')?.setValue('');
  }

  setPatientMode(mode: 'existing' | 'new'): void {
    this.patientMode = mode;
    this.selectedPatient = null;
    this.form.get('patientSearch')?.setValue('');
    if (mode === 'new') {
      this.patientForm.reset({
        firstName: '',
        lastName: '',
        documentTypeId: DocumentType.DNI,
        documentNumber: '',
        consentGiven: false
      });
      this.documentValidationError = null;
    }
  }

  startListening(): void {
    this.speechService.startListening();
  }

  stopListening(): void {
    this.speechService.stopListening();
  }

  resetText(): void {
    this.speechService.resetText();
    this.form.get('text')?.setValue('');
  }

  /**
   * Validates form and patient selection, then saves transcription.
   * If new patient mode, creates patient first then saves transcription.
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validate patient
    if (this.patientMode === 'existing' && !this.selectedPatient) {
      this.saveError = 'Debe seleccionar un paciente.';
      return;
    }

    if (this.patientMode === 'new') {
      if (this.patientForm.invalid) {
        this.patientForm.markAllAsTouched();
        this.saveError = 'Complete los datos del paciente y acepte el consentimiento.';
        return;
      }

      // Validate document format
      if (!this.isDocumentValid()) {
        this.saveError = this.documentValidationError;
        return;
      }
    }

    this.isSaving = true;
    this.saveError = null;

    if (this.patientMode === 'new') {
      this.createPatientAndSave();
    } else {
      this.saveTranscription(this.selectedPatient!.id);
    }
  }

  private createPatientAndSave(): void {
    const documentTypeId = this.patientForm.value.documentTypeId;
    const documentNumber = DocumentValidator.formatDocumentNumber(
      documentTypeId,
      this.patientForm.value.documentNumber
    );

    const patientData: PatientFormViewModel = {
      firstName: this.patientForm.value.firstName,
      lastName: this.patientForm.value.lastName,
      documentTypeId: documentTypeId,
      documentNumber: documentNumber,
      consentGiven: this.patientForm.value.consentGiven
    };

    this.patientService.createPatient(patientData).pipe(
      switchMap((patient) => {
        this.selectedPatient = {
          id: patient.id,
          fullName: `${patient.last_name}, ${patient.first_name}`,
          documentTypeId: patient.document_type_id,
          documentTypeName: this.getDocumentTypeName(patient.document_type_id),
          documentNumber: patient.document_number,
          createdAt: new Date(patient.created_at)
        };
        return this.saveTranscriptionObservable(patient.id);
      })
    ).subscribe({
      next: (transcription) => {
        this.isSaving = false;
        this.resetForm();
        this.toastService.showSuccess('Exito:', 'Paciente y transcripcion guardados correctamente.');
        this.navigateToTranscriptionDetail(transcription.id!);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err.message || 'Error al guardar.';
        this.toastService.showError('Error:', this.saveError!);
      }
    });
  }

  private getDocumentTypeName(documentTypeId: number): string {
    const docType = this.documentTypes.find(dt => dt.id === documentTypeId);
    return docType?.name || 'Desconocido';
  }

  private saveTranscription(patientId: string): void {
    this.saveTranscriptionObservable(patientId).subscribe({
      next: (transcription) => {
        this.isSaving = false;
        this.resetForm();
        this.toastService.showSuccess('Exito:', 'Transcripcion guardada correctamente.');
        this.navigateToTranscriptionDetail(transcription.id!);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err.message || 'Error al guardar la transcripcion.';
        this.toastService.showError('Error:', this.saveError!);
      }
    });
  }

  private saveTranscriptionObservable(patientId: string) {
    const { text, consultationReason, tag_id } = this.form.value;

    const payload: TranscriptionFormViewModel = {
      content: text,
      consultationReason,
      tag_id,
      patient_id: patientId
    };
    return this.transcriptionService.saveTranscription(payload);
  }

  private navigateToTranscriptionDetail(transcriptionId: string): void {
    setTimeout(() => {
      this.router.navigate(['/transcriptions', transcriptionId]);
    }, 500);
  }

  private resetForm(): void {
    this.form.reset({ text: '', consultationReason: '', tag_id: null, patientSearch: '' });
    this.patientForm.reset({
      firstName: '',
      lastName: '',
      documentTypeId: DocumentType.DNI,
      documentNumber: '',
      consentGiven: false
    });
    this.speechService.resetText();
    this.selectedPatient = null;
    this.patientMode = 'existing';
    this.documentValidationError = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.speechService.stopListening();
    this.breadcrumbService.clear();
  }
}
