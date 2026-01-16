import { Component, OnInit, OnDestroy } from '@angular/core';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { TagService } from '../../services/tag.service';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-tag-query',
  imports: [CommonModule, CardModule],
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

  constructor(
    private tagService: TagService,
    private auth: AuthService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Categorías', route: null, icon: 'label' }
    ]);

    this.loadTags();
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadTags();
  }

loadTags(): void {
  this.isLoading = true;
  this.error = null;

  this.auth.isUserAdmin().pipe(
    switchMap((isAdmin) => {
      if (!isAdmin) return of(null); // no llama al servicio
      return this.tagService.getPaginatedGlobalTags({
        page: this.currentPage,
        pageSize: this.pageSize
      });
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


  getPaginationLabel(): string {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    return `Página ${this.currentPage} de ${totalPages}`;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
