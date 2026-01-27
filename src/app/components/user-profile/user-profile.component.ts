import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDetailViewModel } from '../../models/view-models/user/user-detail.view.model';
import { getRoleDisplayName } from '../../models/enums/role.enum';
import { UserService } from '../../services/user.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: UserDetailViewModel | null = null;
  roleDisplay = '';
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Mi Perfil', route: null, icon: 'person' },
    ]);

    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.errorMessage = 'ID de usuario invalido.';
      this.loading = false;
      return;
    }

    this.userService.getUserProfileById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.roleDisplay = getRoleDisplayName(user.role?.name);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
