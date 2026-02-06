import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditLogService } from '../../services/audit-log.service';
import { PatientService } from '../../services/patient.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { AuditLogViewModel } from '../../models/view-models/audit-log.view.model';

@Component({
  selector: 'app-patient-audit',
  imports: [CommonModule],
  templateUrl: './patient-audit.component.html',
  styleUrl: './patient-audit.component.css',
})
export class PatientAuditComponent implements OnInit, OnDestroy {
  patientId: string | null = null;
  patientName = '';
  auditLogs: AuditLogViewModel[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  pageSize = 15;
  totalItems = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auditLogService: AuditLogService,
    private patientService: PatientService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (!this.patientId) {
      this.error = 'ID de paciente no valido';
      this.isLoading = false;
      return;
    }

    this.loadPatientName();
    this.loadAuditLogs();
  }

  private loadPatientName(): void {
    if (!this.patientId) return;

    this.patientService.getPatientById(this.patientId, { audit: false }).subscribe({
      next: (patient) => {
        this.patientName = patient.fullName;
        this.updateBreadcrumbs();
      },
      error: () => {
        this.patientName = 'Paciente';
        this.updateBreadcrumbs();
      },
    });
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Pacientes', route: '/patients', icon: 'people' },
      {
        label: this.patientName || 'Detalle',
        route: `/patients/${this.patientId}`,
        icon: 'person',
      },
      { label: 'Auditoria', route: null, icon: 'history' },
    ]);
  }

  loadAuditLogs(): void {
    if (!this.patientId) return;

    this.isLoading = true;
    this.error = null;

    this.auditLogService
      .getPatientAuditLogs(this.patientId, this.currentPage, this.pageSize)
      .subscribe({
        next: (result) => {
          this.auditLogs = result.items;
          this.totalItems = result.total;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.message;
          this.isLoading = false;
        },
      });
  }

  onPageChange(direction: 'next' | 'prev'): void {
    if (direction === 'next') {
      this.currentPage++;
    } else {
      this.currentPage = Math.max(1, this.currentPage - 1);
    }
    this.loadAuditLogs();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadAuditLogs();
  }

  /**
   * Generates an array of page numbers for pagination display.
   * Shows up to 5 pages centered around the current page.
   */
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'INSERT':
        return 'add_circle';
      case 'UPDATE':
        return 'edit';
      case 'DELETE':
        return 'delete';
      case 'SELECT':
        return 'visibility';
      default:
        return 'info';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'INSERT':
        return 'text-green-500';
      case 'UPDATE':
        return 'text-blue-500';
      case 'DELETE':
        return 'text-red-500';
      case 'SELECT':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  }

  goBack(): void {
    this.router.navigate(['/patients', this.patientId]);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
