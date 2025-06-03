import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';

import { RoleEntity } from '../../../models';

import { CreateUserRequest } from '../../../models/request-interfaces/create-user-request.interface';
import { UserListItemViewModel } from '../../../models/view-models/user/user-list-item-view.model';

@Component({
  selector: 'app-operator-user-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './operator-user-new.component.html',
  styleUrl: './operator-user-new.component.css'
})
export class OperatorUserNewComponent   {
  userForm: FormGroup;

  users: UserListItemViewModel[] = [];
  isLoading = false;
  isCreating = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      full_name: ['', Validators.required],
      role_id: [2, Validators.required] 
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
        this.isCreating = false;
        this.successMessage = `Usuario ${user.email} creado exitosamente`;
        this.userForm.reset({
          role_id: 2 // Restablecer al valor predeterminado
        });
  
      },
      error: (error) => {
        this.isCreating = false;
        this.errorMessage = `Error al crear usuario: ${error.message}`;
      }
    });
  }
}
