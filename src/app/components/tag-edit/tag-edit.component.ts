import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button, ButtonModule } from 'primeng/button';
import { ToastService } from '../../services/common/toast.service';
import { BreadcrumbService } from '../../services/common/breadcrumb.service';

@Component({
  selector: 'app-tag-edit',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './tag-edit.component.html',
  styleUrl: './tag-edit.component.css',
})
export class TagEditComponent {
  tagForm!: FormGroup;
  loading = false;
  tagId!: string;

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private toastService: ToastService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumb();
    this.tagId = this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.tagService.getGlobalTagById(this.tagId).subscribe({
      next: (tag) => this.tagForm.patchValue({ name: tag.name }),
      error: (err) => {
        console.error('Error fetching tag', err);
        this.router.navigate(['/tags']);
      },
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
        label: 'Edición de categoría de transcripción',
      },
    ]);
  }

  goBack() {
    this.router.navigate(['/tags']);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  private buildForm(): void {
    this.tagForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  update(): void {
    if (this.tagForm.invalid) return;

    this.loading = true;
    const name = this.tagForm.value.name;

    this.tagService.updateGlobalTag(this.tagId, name).subscribe({
      next: () => {
        this.toastService.showSuccess(
          'Exito:',
          'Categoría modificada correctamente.'
        );
        this.router.navigate(['/tags']);
      },

      error: (err) => {
        this.loading = false;
        this.toastService.showError(
          'Error:',
          'Ocurrió un error al modificar la categoría.'
        );
        console.error(err);
      },
    });
  }
}
