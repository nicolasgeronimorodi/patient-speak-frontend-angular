import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { ToastService } from '../../services/toast.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';

@Component({
  selector: 'app-patient-edit',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './patient-edit.component.html',
  styleUrl: './patient-edit.component.css'
})
export class PatientEditComponent implements OnInit, OnDestroy {
  patientForm!: FormGroup;
  patientId!: string;
  isLoading = false;

  documentTypes = [
    { id: 1, name: 'DNI' },
    { id: 2, name: 'Libreta Civica' },
    { id: 3, name: 'Libreta de Enrolamiento' },
    { id: 4, name: 'Pasaporte' }
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private patientService: PatientService,
    private toastService: ToastService,
    public router: Router,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.loadPatient();
  }

  private buildForm(): void {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentTypeId: [1, Validators.required],
      documentNumber: [''],
      consentGiven: [false]
    });
  }

  /**
   * Loads patient data and populates form.
   * Uses audit: false to avoid logging access when loading for edit.
   */
  private loadPatient(): void {
    this.isLoading = true;
    this.patientService.getPatientById(this.patientId, { audit: false }).subscribe({
      next: (patient) => {
        this.patientForm.patchValue({
          firstName: patient.firstName,
          lastName: patient.lastName,
          documentTypeId: patient.documentTypeId,
          documentNumber: patient.documentNumber,
          consentGiven: patient.consentGiven
        });

        this.breadcrumbService.setBreadcrumbs([
          { label: 'Inicio', route: '/home', icon: 'home' },
          { label: 'Pacientes', route: '/patients', icon: 'people' },
          { label: patient.fullName, route: `/patients/${this.patientId}`, icon: 'person' },
          { label: 'Editar', route: null, icon: 'edit' }
        ]);

        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showError('Error', `Error al cargar paciente: ${err.message}`);
        this.isLoading = false;
      }
    });
  }

  updatePatient(): void {
    if (this.patientForm.invalid) return;

    this.isLoading = true;

    this.patientService.updatePatient(this.patientId, this.patientForm.value).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(): void {
    this.isLoading = false;
    this.resetFormState();
    this.patientForm.disable();
    this.toastService.showSuccess('Exito', 'Datos del paciente actualizados correctamente.');

    timer(2000).subscribe(() => {
      this.router.navigate(['/patients', this.patientId]);
    });
  }

  private handleError(err: any): void {
    this.resetFormState();
    this.toastService.showError('Error', `Error al actualizar paciente: ${err.message}`);
    this.isLoading = false;
  }

  private resetFormState(): void {
    this.patientForm.reset();
    Object.values(this.patientForm.controls).forEach(control => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
