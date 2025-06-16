import { Component, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule,  RouterModule, TopBarComponent, SidebarComponent, BreadcrumbComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  @Input() appTitle: string = 'Sistema de Transcripción';
  @Input() isAdmin: boolean = false;

  sidebarCollapsed = false;

  toggleSidebarState() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  logout(): void {
    this.authService.signOut().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  constructor(private authService: AuthService, private router: Router) {}

}
