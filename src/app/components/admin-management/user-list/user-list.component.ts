import { Component, Input, OnInit } from '@angular/core';
import { UserListItemViewModel } from '../../../models/view-models/user/user-list-item-view.model';
import { DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, DatePipe, TableModule, CardModule, ButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: UserListItemViewModel[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
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
}
