import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-authentication-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './authentication-layout.component.html',
  styleUrl: './authentication-layout.component.css'
})
export class AuthenticationLayoutComponent {

    title: string = 'Sistema de Transcripción Médica';

}
