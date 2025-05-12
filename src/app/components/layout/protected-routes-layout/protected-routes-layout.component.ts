import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MainLayoutComponent } from "../main-layout/main-layout.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authenticated-layout',
  imports: [MainLayoutComponent, RouterModule, CommonModule],
  templateUrl: './protected-routes-layout.component.html',
  styleUrl: './protected-routes-layout.component.css'
})
export class ProtectedRoutesLayoutComponent implements OnInit {

  isAdmin: boolean = false;
  appTitle: string = 'Sistema de Transcripción Médica';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    
  }

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe(isAuth => {
      if(!isAuth){
        this.router.navigate(['/login']);
      }
    });


    this.authService.isUserAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    
  }

}
