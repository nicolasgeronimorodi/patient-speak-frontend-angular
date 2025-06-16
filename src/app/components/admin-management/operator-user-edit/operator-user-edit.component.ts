import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { timer } from 'rxjs';
import { BreadcrumbService } from '../../../services/breadcrumb.service';

@Component({
  selector: 'app-operator-user-edit',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './operator-user-edit.component.html',
  styleUrl: './operator-user-edit.component.css',
})
export class OperatorUserEditComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  userId!: string;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private toastService: ToastService,
    private router: Router
  ) {}

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
        label: 'Edición de usuario operador',
      },
    ]);
  }

  ngOnInit(): void {
    this.buildBreadcrumb();
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  private buildForm(): void {
    this.userForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      full_name: ['', Validators.required],
      roleName: [{ value: '', disabled: true }],
      createdAt: [{ value: '', disabled: true }],
    });
  }

  private loadUser(): void {
    this.isLoading = true;
    this.userService.getOperatorUserById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          full_name: user.fullName,
          createdAt: user.createdAt,
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showError(
          'Error: ',
          `Error al cargar usuario: ${err.message}`
        );
        this.isLoading = false;
      },
    });
  }

  updateUser(): void {
    if (this.userForm.invalid) return;

    const updatedName = this.userForm.get('full_name')?.value;
    this.isLoading = true;

    this.userService.updateUserName(this.userId, updatedName).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err),
    });
  }

  private handleSuccess(): void {
    this.isLoading = false;
    this.resetFormState();
    this.userForm.disable();
    this.toastService.showSuccess(
      'Éxito:',
      'Nombre actualizado correctamente.'
    );

    timer(2000).subscribe(() => {
      this.router.navigate(['/admin/users/list']);
    });
  }

  private handleError(err: any): void {
    this.resetFormState();
    this.toastService.showError(
      'Error: ',
      `Error al intentar actualizar usuario. usuario: ${err.message}`
    );
    this.isLoading = false;
  }

  private resetFormState(): void {
    this.userForm.reset();
    Object.values(this.userForm.controls).forEach((control) => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });
  }
}
