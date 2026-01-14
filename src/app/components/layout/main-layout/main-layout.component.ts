import { Component, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule,  RouterModule, TopBarComponent, SidebarComponent, BreadcrumbComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

  }

  @Input() appTitle: string = 'Sistema de Transcripción';
  @Input() isAdmin: boolean = false;

  get currentYear(): number {
    return new Date().getFullYear();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error logging out:', error);
        // Aún así, redirigir al login
        this.router.navigate(['/login']);
      }
    });
  }

}
