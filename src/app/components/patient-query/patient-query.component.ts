import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PatientService } from '../../services/patient.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ConfirmService } from '../../services/confirm.service';
import { PatientListItemViewModel } from '../../models/view-models/patient-list-item.view.model';
import { PatientFilterViewModel } from '../../models/view-models/patient-filter.view.model';

@Component({
  selector: 'app-patient-query',
  providers: [ConfirmService],
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-query.component.html',
  styleUrl: './patient-query.component.css'
})
export class PatientQueryComponent implements OnInit, OnDestroy {
  patients: PatientListItemViewModel[] = [];
  isLoading = false;
  error: string | null = null;

  currentPage = 1;
  pageSize = 12;
  totalItems = 0;

  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    private patientService: PatientService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Pacientes', route: null, icon: 'people' }
    ]);

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadPatients();
    });

    this.loadPatients();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(direction: 'next' | 'prev'): void {
    if (direction === 'next') {
      this.currentPage++;
    } else {
      this.currentPage = Math.max(1, this.currentPage - 1);
    }
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.error = null;

    const filter: PatientFilterViewModel = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined
    };

    this.patientService.getPaginatedPatients(filter).subscribe({
      next: (result) => {
        this.patients = result.items;
        this.totalItems = result.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadPatients();
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

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/patients', id]);
  }

  onDeactivate(id: string): void {
    this.confirmService.confirmDelete('desactivar', 'el paciente').subscribe((confirmed) => {
      if (!confirmed) return;

      this.patientService.deactivatePatient(id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    });
  }

  onHardDelete(id: string): void {
    this.confirmService.confirmHardDelete('este paciente').subscribe((confirmed) => {
      if (!confirmed) return;

      this.patientService.hardDeletePatient(id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
    this.searchSubject.complete();
  }
}
