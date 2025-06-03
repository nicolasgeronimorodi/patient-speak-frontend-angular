import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-top-bar',
  imports: [
    CommonModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent implements OnInit, OnChanges {
  @Input() isAdmin: boolean = false;
  @Input() appTitle: string = 'App';
  @Output() logoutEvent = new EventEmitter<void>();

  userMenuItems: MenuItem[] = [];
  isDarkModeActive: boolean = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(mode => {
      this.isDarkModeActive = mode;
    });
    this.buildMenu();
  }

  ngOnChanges(): void {
    this.buildMenu();
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.logoutEvent.emit();
  }

  private buildMenu(): void {
    this.userMenuItems = [
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        routerLink: '/profile',
      },
      {
        separator: true,
      },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }
}
