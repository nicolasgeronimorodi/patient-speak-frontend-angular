import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, SidebarModule, ButtonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isAdmin: boolean = false;
  menuItems: MenuItem[] = [];
  visible: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Navegación',
        icon: 'pi pi-fw pi-compass',
        items: [
          {
            label: 'Inicio',
            icon: 'pi pi-fw pi-home',
            routerLink: '/home'
          },
          {
            label: 'Transcripciones',
            icon: 'pi pi-fw pi-file-edit',
            routerLink: '/transcriptions'
          }
        ]
      }
    ];

    if (this.isAdmin) {
      this.menuItems.push({
        label: 'Administración',
        icon: 'pi pi-fw pi-cog',
        items: [
          {
            label: 'Usuarios',
            icon: 'pi pi-fw pi-users',
            routerLink: '/admin/users'
          }
        ]
      });
    }
  }

  toggleSidebar() {
    this.visible = !this.visible;
  }
}