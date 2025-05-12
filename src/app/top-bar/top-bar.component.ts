import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class TopBarComponent {

  @Input() appTitle: string = 'App';
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
      routerLink: '/settings'
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

  logout() {
    this.logoutEvent.emit();
  }

}
