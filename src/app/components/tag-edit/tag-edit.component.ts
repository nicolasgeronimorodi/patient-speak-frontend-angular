import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-tag-edit',
  imports: [ReactiveFormsModule, CommonModule, CardModule, InputTextModule, ButtonModule],
  templateUrl: './tag-edit.component.html',
  styleUrl: './tag-edit.component.css'
})
export class TagEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  loadingTag = true;
  tagId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Administracion', route: null, icon: 'admin_panel_settings' },
      { label: 'Categorias', route: '/admin/tags', icon: 'label' },
      { label: 'Editar Categoria', route: null, icon: 'edit' }
    ]);

    this.form = this.fb.group({
      name: ['', Validators.required],
    });

    this.loadTag();
  }

  private loadTag(): void {
    this.tagId = this.route.snapshot.paramMap.get('id');

    if (!this.tagId) {
      this.router.navigate(['admin/tags']);
      return;
    }

    this.tagService.getTagById(this.tagId).subscribe({
      next: (tag) => {
        this.form.patchValue({ name: tag.name });
        this.loadingTag = false;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['admin/tags']);
      }
    });
  }

  update(): void {
    if (this.form.invalid || !this.tagId) return;

    this.loading = true;
    const name = this.form.value.name;

    this.tagService.updateTag(this.tagId, name).subscribe({
      next: () => this.router.navigate(['admin/tags']),
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
