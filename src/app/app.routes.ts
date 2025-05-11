import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { OperatorUserNewComponent } from './components/admin-management/operator-user-new/operator-user-new.component';
import { ProtectedRoutesLayoutComponent } from './protected-routes-layout/protected-routes-layout.component';
import { AuthenticationLayoutComponent } from './authentication-layout/authentication-layout.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  // {path: '', redirectTo: '/home', pathMatch: 'full'},
  // {path: 'login', component: LoginComponent},
  // {path: 'register', component: RegisterComponent},
  // {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  // {path: 'admin/users', component: OperatorUserNewComponent, canActivate: [AuthGuard, adminGuard]},
  // {path: '*', redirectTo: '/home'}

  {
    path: '',
    component: ProtectedRoutesLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'admin/users',
        component: OperatorUserNewComponent,
        canActivate: [AuthGuard, adminGuard],
      },
    ],
  },

  {
    path: '',
    component: AuthenticationLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
