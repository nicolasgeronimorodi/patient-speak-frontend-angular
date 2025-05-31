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
        label: 'Navegación',
        icon: 'pi pi-fw pi-compass',
        items: [
          {
            label: 'Inicio',
            icon: 'pi pi-fw pi-home',
            routerLink: '/home',
          },
          {
            label: 'Transcripciones',
            icon: 'pi pi-fw pi-file-edit',
            routerLink: '/transcriptions',
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
            label: 'Alta de usuario operador',
            icon: 'pi pi-users',
            routerLink: '/admin/users',
          },
          {
            label: 'Categorías de transcripción',
            icon: 'pi pi-sliders-h',
            routerLink: '/tags',
          },
        ],
      });
    }
  }

  toggleSidebar() {
    this.visible = !this.visible;
  }
}
