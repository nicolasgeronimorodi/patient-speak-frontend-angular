import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignInRequest } from '../../models'; // Importamos la interfaz desde nuestros modelos

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
 
  constructor(private authService: AuthService, private router: Router) {}
 
  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }
   
    this.isLoading = true;
    this.errorMessage = '';
   
    this.authService.signIn(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.error) {
          this.errorMessage = response.error;
          return;
        }
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al iniciar sesión';
      }
    });
  }
}
