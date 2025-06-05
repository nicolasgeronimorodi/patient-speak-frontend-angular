import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    PanelMenuModule,
    SidebarModule,
    ButtonModule,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isAdmin: boolean = false;
  menuItems: MenuItem[] = [];
  visible: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildMenu();
  }

  ngOnChanges(): void {
    //TODO: Refactorizar en capa superior con observable de isAdmin
    this.buildMenu();
  }

  private buildMenu(): void {
    this.menuItems = [
      {
        label: 'Transcripciones',
        icon: 'pi pi-fw pi-compass',
        items: [
          {
            label: 'Inicio',
            icon: 'pi pi-fw pi-home',
            routerLink: '/home',
          },
          {
            label: 'Nueva ranscripción',
            icon: 'pi pi-fw pi-file-edit',
            routerLink: '/transcription/new',
          },
        ],
      },
    ];
    if (this.isAdmin) {
      this.menuItems.push({
        label: 'Administración del sistema',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Lista de usuarios',
            icon: 'pi pi-users',
            routerLink: '/admin/users/list',
          },
          {
            label: 'Alta de usuario operador',
            icon: 'pi pi-users',
            routerLink: '/admin/users/operator-users/new',
          },
          {
            label: 'Categorías de transcripción',
            icon: 'pi pi-sliders-h',
            routerLink: '/tags',
          },
          {
            label: 'Alta de categoría de transcripción',
            icon: 'pi pi-sliders-h',
            routerLink: '/tags/new',
          }
        ],
      },
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Transcripciones por día',
            icon: 'pi pi-calendar',
            routerLink: '/dashboard/charts/transcriptions-per-day',
          },
          {
            label: 'Transcripciones por categoría',
            icon: 'pi pi-tags',
            routerLink: '/dashboard/charts/transcriptions-by-tag',
          },
        ],
      }
    
    
    );
    }
  }

  toggleSidebar() {
    this.visible = !this.visible;
  }
}

