import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tag-new',
  imports: [ReactiveFormsModule, CommonModule, CardModule, InputTextModule, ButtonModule],
  templateUrl: './tag-new.component.html',
  styleUrl: './tag-new.component.css'
})
export class TagNewComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
    });
  }

  create(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const name = this.form.value.name;

    this.tagService.createGlobalTag(name).subscribe({
      next: () =>
      {
        this.loading = false;
        this.toastService.showSuccess('Éxito', 'Categoría creada correctamente');
        this.router.navigate(['/tags']);
      },
 
      error: (err) => {
        this.toastService.showError('Error', 'Ocurrió un error creando la categoría.');
        this.loading = false;
        console.error(err);
      }
    });
  }
}