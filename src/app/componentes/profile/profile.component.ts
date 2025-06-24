import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '@supabase/supabase-js';
import { BreadcrumbService } from '../../services/common/breadcrumb.service';
import { Router } from '@angular/router';
import { UserInfoDetailViewModel } from '../../models/view-models/user/user-info-detail.view.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  userInfo!: UserInfoDetailViewModel;
  isLoading = false;

  constructor(
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumb();
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  private buildBreadcrumb(): void {
    this.breadcrumbService.buildBreadcrumb([
      {
        label: 'Home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Perfil',
      },
    ]);
  }

  private loadUserInfo(): void {
    this.isLoading = true;
    this.userService.getCurrentUserInfo().subscribe({
      next: (user) => {
        this.userInfo = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil de usuario:', err);
        this.isLoading = false;
      },
    });
  }
}
