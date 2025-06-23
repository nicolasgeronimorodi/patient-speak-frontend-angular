import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';

import { RoleEntity } from '../../../models';

import { CreateUserRequest } from '../../../models/request-interfaces/create-user-request.interface';
import { UserListItemViewModel } from '../../../models/view-models/user/user-list-item-view.model';
import { UserDetailViewModel } from '../../../models/view-models/user/user-detail.view.model';
import { BreadcrumbService } from '../../../services/common/breadcrumb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operator-user-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './operator-user-new.component.html',
  styleUrl: './operator-user-new.component.css',
})
export class OperatorUserNewComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;

  users: UserListItemViewModel[] = [];
  isLoading = false;
  isCreating = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private breadcrumbService: BreadcrumbService
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
        label: 'Alta de usuario operador',
      },
    ]);
  }

  ngOnInit(): void {
    this.buildForm();
    this.buildBreadcrumb();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  private buildForm(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      role_id: [2, Validators.required],
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.isCreating = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userData: CreateUserRequest = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.handleSuccess(user);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  private handleSuccess(user: UserDetailViewModel): void {
    this.isCreating = false;
    this.resetFormState();
    this.successMessage = `Usuario ${user.email} creado exitosamente`;
    this.userForm.reset({
      role_id: 2, // Restablecer al valor predeterminado
    });
  }

  private handleError(err: any): void {
    this.isCreating = false;
    this.resetFormState();
    this.errorMessage = `Error al crear usuario: ${err.message}`;
  }

  private resetFormState(): void {
    this.userForm.reset({
      role_id: 2,
    });
    this.userForm.reset();
    Object.values(this.userForm.controls).forEach((control) => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });
  }
}
