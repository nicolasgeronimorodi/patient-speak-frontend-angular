import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/common/toast.service';
import { BreadcrumbService } from '../../services/common/breadcrumb.service';

@Component({
  selector: 'app-tag-new',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './tag-new.component.html',
  styleUrl: './tag-new.component.css',
})
export class TagNewComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumb();
    this.form = this.fb.group({
      name: ['', Validators.required],
    });
  }

  buildBreadcrumb() {
    this.breadcrumbService.buildBreadcrumb([
      {
        label: 'Home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Administración del sistema',
      },
      {
        label: 'Categorías de transcripción',
        command: () => this.router.navigate(['/tags']),
      },
      {
        label: 'Alta de categoría de transcripción',
      },
    ]);
  }

  goBack() {
    this.router.navigate(['/tags']);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  create(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const name = this.form.value.name;

    this.tagService.createGlobalTag(name).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess(
          'Éxito',
          'Categoría creada correctamente'
        );
        this.router.navigate(['/tags']);
      },

      error: (err) => {
        this.toastService.showError(
          'Error',
          'Ocurrió un error creando la categoría.'
        );
        this.loading = false;
        console.error(err);
      },
    });
  }
}
