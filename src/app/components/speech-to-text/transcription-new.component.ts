import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { SpeechToTextServiceFacadeService } from '../../services/speech-to-text/speech-to-text-facade.service';
import { TranscriptionFormViewModel } from '../../models/view-models/transcription-form.view.model';
import { TagService } from '../../services/tag.service';
import { TranscriptionService } from '../../services/transcription.service';
import { PatientService } from '../../services/patient.service';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { PatientListItemViewModel } from '../../models/view-models/patient-list-item.view.model';
import { PatientFormViewModel } from '../../models/view-models/patient-form.view.model';
import { ToastService } from '../../services/toast.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
    selector: 'app-transcription-new',
    imports: [CommonModule, ReactiveFormsModule, DropdownModule, AutoCompleteModule, CheckboxModule],
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

  documentTypes = [
    { code: 'DNI', name: 'DNI' },
    { code: 'PASAPORTE', name: 'Pasaporte' },
    { code: 'CUIT', name: 'CUIT/CUIL' },
  ];

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
    private patientService: PatientService,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.form = this.fb.group({
      text: ['', Validators.required],
      consultationReason: ['', Validators.required],
      tag_id: [null, Validators.required],
      language: [''],
      patientSearch: ['']
    });

    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentType: ['DNI'],
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
        documentType: 'DNI',
        documentNumber: '',
        consentGiven: false
      });
    }
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

    if (this.patientMode === 'new' && this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.saveError = 'Complete los datos del paciente y acepte el consentimiento.';
      return;
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
    const patientData: PatientFormViewModel = {
      firstName: this.patientForm.value.firstName,
      lastName: this.patientForm.value.lastName,
      documentType: this.patientForm.value.documentType,
      documentNumber: this.patientForm.value.documentNumber || null,
      consentGiven: this.patientForm.value.consentGiven
    };

    this.patientService.createPatient(patientData).pipe(
      switchMap((patient) => {
        this.selectedPatient = {
          id: patient.id,
          fullName: `${patient.last_name}, ${patient.first_name}`,
          documentType: patient.document_type,
          documentNumber: patient.document_number,
          createdAt: new Date(patient.created_at)
        };
        return this.saveTranscriptionObservable(patient.id);
      })
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.resetForm();
        this.toastService.showSuccess('Exito:', 'Paciente y transcripcion guardados correctamente.');
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err.message || 'Error al guardar.';
        this.toastService.showError('Error:', this.saveError!);
      }
    });
  }

  private saveTranscription(patientId: string): void {
    this.saveTranscriptionObservable(patientId).subscribe({
      next: () => {
        this.isSaving = false;
        this.resetForm();
        this.toastService.showSuccess('Exito:', 'Transcripcion guardada correctamente.');
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err.message || 'Error al guardar la transcripcion.';
        this.toastService.showError('Error:', this.saveError!);
      }
    });
  }

  private saveTranscriptionObservable(patientId: string) {
    const { text, consultationReason, tag_id, language } = this.form.value;

    const payload: TranscriptionFormViewModel = {
      content: text,
      consultationReason,
      tag_id,
      language,
      patient_id: patientId
    };
    return this.transcriptionService.saveTranscription(payload);
  }

  private resetForm(): void {
    this.form.reset({ text: '', consultationReason: '', tag_id: null, language: this.defaultLanguage, patientSearch: '' });
    this.patientForm.reset({
      firstName: '',
      lastName: '',
      documentType: 'DNI',
      documentNumber: '',
      consentGiven: false
    });
    this.speechService.resetText();
    this.selectedPatient = null;
    this.patientMode = 'existing';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.speechService.stopListening();
    this.breadcrumbService.clear();
  }
}
