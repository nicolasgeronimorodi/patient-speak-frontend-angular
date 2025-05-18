import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {ButtonModule} from 'primeng/button'
@Component({
  selector: 'app-authentication-layout',
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './authentication-layout.component.html',
  styleUrl: './authentication-layout.component.css'
})
export class AuthenticationLayoutComponent {

    title: string = 'Sistema de Transcripción Médica';

    toggleDarkMode(){
    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('app-dark');
    }
  }


}
