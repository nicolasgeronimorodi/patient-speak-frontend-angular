import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserListItemViewModel } from '../../../models/view-models/user/user-list-item-view.model';
import { DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { ConfirmService } from '../../../services/confirm.service';
import { ToastService } from '../../../services/toast.service';
import { RoleBadgeComponent } from '../../shared/role-badge/role-badge.component';

@Component({
  selector: 'app-user-list',
  providers: [ConfirmService],
  imports: [CommonModule, DatePipe, TableModule, CardModule, ButtonModule, TooltipModule, RoleBadgeComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: UserListItemViewModel[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Administración', route: null, icon: 'admin_panel_settings' },
      { label: 'Lista de usuarios', route: null, icon: 'people' }
    ]);

    this.loadUsers(this.currentPage, this.pageSize);
  }

  loadUsers(page: number, pageSize: number): void {
    this.isLoading = true;
    this.userService.getUsers(page, pageSize).subscribe({
      next: (result) => {
        this.users = result.users;
        this.totalRecords = result.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.users = [];
        this.totalRecords = 0;
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.currentPage = event.page + 1; // PrimeNG pages are 0-based
    this.loadUsers(this.currentPage, this.pageSize);
  }

  navigateToEdit(userId: string): void {
    this.router.navigate(['admin/users/edit', userId]);
  }

  navigateToNewOperatorUser(): void {
    this.router.navigate(['/admin/users/operator-users/new']);
  }

  onDeactivateUser(user: UserListItemViewModel): void {
    this.confirmService.confirmDelete('desactivar al usuario', user.fullName || user.email).subscribe(confirmed => {
      if (confirmed) {
        this.userService.deactivateUser(user.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Exito', 'Usuario desactivado correctamente');
            this.loadUsers(this.currentPage, this.pageSize);
          },
          error: (err) => {
            this.toastService.showError('Error', err.message);
          }
        });
      }
    });
  }

  onActivateUser(user: UserListItemViewModel): void {
    this.confirmService.confirmAction(
      'Activar usuario',
      `¿Esta seguro de que desea activar al usuario ${user.fullName || user.email}?`
    ).subscribe(confirmed => {
      if (confirmed) {
        this.userService.activateUser(user.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Exito', 'Usuario activado correctamente');
            this.loadUsers(this.currentPage, this.pageSize);
          },
          error: (err) => {
            this.toastService.showError('Error', err.message);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
