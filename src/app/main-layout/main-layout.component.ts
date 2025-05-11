import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  imports: [],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  @Input() appTitle: string = 'Sistema de Transcripción';
  @Input() isAdmin: boolean = false;

  get currentYear(): number {
    return new Date().getFullYear();
  }

  logout(): void {
    console.log('Cerrar sesión');
  }

}
