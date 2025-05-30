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
export class OperatorUserNewComponent implements OnInit {
  userForm: FormGroup;
  roles: RoleEntity[] = [];
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
      full_name: [''],
      role_id: [2, Validators.required] // Valor predeterminado: transcription_basic_operator
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        this.errorMessage = `Error al cargar roles: ${error.message}`;
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = `Error al cargar usuarios: ${error.message}`;
        this.isLoading = false;
      }
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
        this.loadUsers(); // Recargar la lista de usuarios
      },
      error: (error) => {
        this.isCreating = false;
        this.errorMessage = `Error al crear usuario: ${error.message}`;
      }
    });
  }
}
