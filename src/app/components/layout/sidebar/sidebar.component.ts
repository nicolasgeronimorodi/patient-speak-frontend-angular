import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {AccordionModule} from 'primeng/accordion'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

interface SidebarGroup {
  label: string;
  icon: string;
  items: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, AccordionModule, CommonModule, RouterModule, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isAdmin: boolean = false;
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  menuItems: SidebarGroup[] = [];

  ngOnInit() {
    this.buildMenu();
  }

  ngOnChanges() {
    this.buildMenu();
  }

  onToggleClick() {
    this.toggle.emit();
  }

  private buildMenu(): void {
    this.menuItems = [
      {
        label: 'Transcripciones',
        icon: 'pi pi-fw pi-compass',
        expanded: false,
        items: [
          { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: '/home' },
          { label: 'Nueva transcripción', icon: 'pi pi-fw pi-file-edit', routerLink: '/transcription/new' },
        ],
      },
    ];

    if (this.isAdmin) {
      this.menuItems.push(
        {
          label: 'Administración del sistema',
          icon: 'pi pi-cog',
          expanded: false,
          items: [
            { label: 'Lista de usuarios', icon: 'pi pi-users', routerLink: '/admin/users/list' },
            { label: 'Alta de usuario operador', icon: 'pi pi-user-plus', routerLink: '/admin/users/operator-users/new' },
            { label: 'Categorías de transcripción', icon: 'pi pi-tags', routerLink: '/tags' },
            { label: 'Alta de categoría de transcripción', icon: 'pi pi-plus', routerLink: '/tags/new' },
          ]
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-chart-bar',
          expanded: false,
          items: [
            { label: 'Transcripciones por día', icon: 'pi pi-calendar', routerLink: '/dashboard/charts/transcriptions-per-day' },
            { label: 'Transcripciones por categoría', icon: 'pi pi-tags', routerLink: '/dashboard/charts/transcriptions-by-tag' },
          ]
        }
      );
    }
  }
}


  
  /*
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
  } */