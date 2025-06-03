import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignInRequest } from '../../../models'; // Importamos la interfaz desde nuestros modelos
import { ButtonModule } from 'primeng/button';
import {CardModule} from 'primeng/card'
import {InputGroupModule} from 'primeng/inputgroup'
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputTextModule} from 'primeng/inputtext'
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, CardModule, InputGroupModule, InputGroupAddonModule, InputTextModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const sub = this.authService.signIn(this.email, this.password).subscribe({
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

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}