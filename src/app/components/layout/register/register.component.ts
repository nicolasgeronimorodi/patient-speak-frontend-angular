import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignUpRequest } from '../../../models'; // Importamos la interfaz desde nuestros modelos

@Component({
    selector: 'app-register',
    imports: [RouterModule, FormsModule, CommonModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
 
  constructor(private authService: AuthService, private router: Router) {}
 
  register(): void {
    // Validaciones básicas
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }
   
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
   
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
   
    this.isLoading = true;
    this.errorMessage = '';
   
    this.authService.signUp(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.error) {
          this.errorMessage = response.error;
          return;
        }
        // Puedes redirigir al login o directamente a home dependiendo de si Supabase
        // requiere verificación de email
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al crear la cuenta';
      }
    });
  }
}
