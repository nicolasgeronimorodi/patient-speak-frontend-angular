import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-tag-new',
  imports: [ReactiveFormsModule, CommonModule, CardModule, InputTextModule, ButtonModule],
  templateUrl: './tag-new.component.html',
  styleUrl: './tag-new.component.css'
})
export class TagNewComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private router: Router,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Categorías', route: '/tags', icon: 'label' },
      { label: 'Nueva Categoría', route: null, icon: 'add_circle_outline' }
    ]);

    this.form = this.fb.group({
      name: ['', Validators.required],
    });
  }

  create(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const name = this.form.value.name;

    this.tagService.createGlobalTag(name).subscribe({
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