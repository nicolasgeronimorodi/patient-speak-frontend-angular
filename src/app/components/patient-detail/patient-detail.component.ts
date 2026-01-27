import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ConfirmService } from '../../services/confirm.service';
import { PatientDetailViewModel } from '../../models/view-models/patient-detail.view.model';

@Component({
  selector: 'app-patient-detail',
  providers: [ConfirmService],
  imports: [CommonModule],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css'
})
export class PatientDetailComponent implements OnInit, OnDestroy {
  patient: PatientDetailViewModel | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private breadcrumbService: BreadcrumbService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      this.error = 'ID de paciente no valido';
      this.isLoading = false;
      return;
    }

    this.loadPatient(patientId);
  }

  loadPatient(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.isLoading = false;
        this.updateBreadcrumbs();
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Pacientes', route: '/patients', icon: 'people' },
      { label: this.patient?.fullName || 'Detalle', route: null, icon: 'person' }
    ]);
  }

  onDeactivate(): void {
    if (!this.patient) return;

    this.confirmService.confirmDelete('el paciente').subscribe((confirmed) => {
      if (!confirmed) return;

      this.patientService.deactivatePatient(this.patient!.id).subscribe({
        next: () => {
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
