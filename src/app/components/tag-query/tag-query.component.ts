import { Component, OnInit, OnDestroy } from '@angular/core';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { TagService } from '../../services/tag.service';
import { AuthService } from '../../services/auth.service';
import { of, Subject, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Router } from '@angular/router';
import { TagFilterViewModel } from '../../models/view-models/tag-filter.view.model';
import { ActionMenuComponent, ActionMenuItem } from '../shared/action-menu/action-menu.component';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tag-query',
  providers: [ConfirmService],
  imports: [CommonModule, FormsModule, ActionMenuComponent],
  templateUrl: './tag-query.component.html',
  styleUrl: './tag-query.component.css'
})
export class TagQueryComponent implements OnInit, OnDestroy {
  tags: CreateTagResponse[] = [];
  isLoading = false;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  searchTerm = '';
  private searchSubject = new Subject<string>();

  tagActions: ActionMenuItem[] = [
    { id: 'delete', label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500' }
  ];

  constructor(
    private tagService: TagService,
    private auth: AuthService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Administración', route: null, icon: 'admin_panel_settings' },
      { label: 'Categorías', route: 'admin/tags', icon: 'label' }
    ]);

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadTags();
    });

    this.loadTags();
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
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.error = null;

    const filter: TagFilterViewModel = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined
    };

    this.auth.isUserAdmin().pipe(
      switchMap((isAdmin) => {
        if (!isAdmin) return of(null);
        return this.tagService.getPaginatedGlobalTags(filter);
      })
    ).subscribe({
      next: (result) => {
        if (!result) {
          this.tags = [];
          this.totalItems = 0;
          this.isLoading = false;
          return;
        }

        this.tags = result.items;
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
    this.loadTags();
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

  navigateToAddCategory(): void {
    this.router.navigate(['/admin/tags/new']);
  }

  /**
   * Handles action menu events for a specific tag.
   * Routes to appropriate handler based on action id.
   */
  onTagAction(actionId: string, tag: CreateTagResponse): void {
    if (actionId === 'delete') {
      this.confirmService.confirmDelete(tag.name).subscribe(confirmed => {
        if (confirmed) {
          this.tagService.deactivateTag(tag.id).subscribe({
            next: () => {
              this.toastService.showSuccess('Exito', 'Categoria eliminada correctamente');
              this.loadTags();
            },
            error: (err) => {
              this.toastService.showError('Error', err.message);
            }
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
    this.searchSubject.complete();
  }
}
