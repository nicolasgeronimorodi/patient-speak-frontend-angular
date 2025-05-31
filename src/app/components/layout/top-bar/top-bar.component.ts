import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {MenubarModule} from 'primeng/menubar';
import {ButtonModule} from 'primeng/button'
import {AvatarModule} from 'primeng/avatar'
import {MenuModule} from 'primeng/menu'

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, MenubarModule, ButtonModule, AvatarModule, MenuModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit{


  ngOnInit(): void {
    this.isDarkModeActive = document.documentElement.classList.contains('app-dark');
  }

  @Input() appTitle: string = 'App';
  isDarkModeActive: boolean = false;

  @Output() logoutEvent = new EventEmitter<void>();
  
  userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      routerLink: '/profile'
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        {
        label: 'Usuarios',
        icon: 'pi pi-users',
        routerLink: '/admin/users'
      },
      {
        label: 'Preferencias',
        icon: 'pi pi-sliders-h',
        routerLink: '/settings'
      }
      ]
    },
    {
      separator: true
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        this.logoutEvent.emit();
      }
    }
  ];

    toggleDarkMode(){
    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('app-dark');
    }
  }

  logout() {
    this.logoutEvent.emit();
  }

}
