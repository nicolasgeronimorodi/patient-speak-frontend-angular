import {
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isAdmin: boolean = false;
  @Input() isCollapsed: boolean = false;
  menuItems: MenuGroup[] = [];

  ngOnInit() {
    this.buildMenu();
  }

  ngOnChanges(): void {
    this.buildMenu();
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  private buildMenu(): void {
    this.menuItems = [
      {
        label: 'Transcripciones',
        items: [
          {
            label: 'Inicio',
            icon: 'home',
            routerLink: '/home',
          },
          {
            label: 'Nueva transcripción',
            icon: 'add_circle_outline',
            routerLink: '/transcription/new',
          },
        ],
      },
      {
        label: 'Pacientes',
        items: [
          {
            label: 'Gestionar pacientes',
            icon: 'people',
            routerLink: '/patients',
          },
        ],
      },
    ];

    if (this.isAdmin) {
      this.menuItems.push(
        {
          label: 'Administración',
          items: [
            {
              label: 'Lista de usuarios',
              icon: 'group',
              routerLink: '/admin/users/list',
            },
            {
              label: 'Alta de usuario operador',
              icon: 'person_add_alt',
              routerLink: '/admin/users/operator-users/new',
            },
            {
              label: 'Categorías',
              icon: 'category',
              routerLink: 'admin/tags',
            },
          ],
        },
        {
          label: 'Reportes',
          items: [
            {
              label: 'Estadísticas diarias',
              icon: 'bar_chart',
              routerLink: '/dashboard/charts/transcriptions-per-day',
            },
            {
              label: 'Reporte por categoría',
              icon: 'pie_chart',
              routerLink: '/dashboard/charts/transcriptions-by-tag',
            },
          ],
        },
      );
    }
  }
}

