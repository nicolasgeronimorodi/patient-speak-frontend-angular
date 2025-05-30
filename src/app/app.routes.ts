import { Routes } from '@angular/router';
import { LoginComponent } from './components/layout/login/login.component';
import { RegisterComponent } from './components/layout/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { OperatorUserNewComponent } from './components/admin-management/operator-user-new/operator-user-new.component';
import { ProtectedRoutesLayoutComponent } from './components/layout/protected-routes-layout/protected-routes-layout.component';
import { AuthenticationLayoutComponent } from './components/layout/authentication-layout/authentication-layout.component';
import { NotFoundComponent } from './components/layout/not-found-layout/not-found.component';
import { TranscriptionQueryComponent } from './components/transcriptions/transcription-query.component';
import { TranscriptionDetailAccessGuard } from './guards/transcription-detail-access.guard';
import { TranscriptionDetailComponent } from './components/transcription-detail/transcription-detail.component';
import { ObservationsQueryComponent } from './components/observations-query/observations-query.component';

export const routes: Routes = [
  {
    path: '',
    component: ProtectedRoutesLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'transcriptions/:id',
        component: TranscriptionDetailComponent,
        canActivate: [TranscriptionDetailAccessGuard],
      },
      {
        path: 'transcriptions/:id/observations',
        component: ObservationsQueryComponent,
      },

      { path: 'transcriptions', component: TranscriptionQueryComponent },
      {
        path: 'admin/users',
        component: OperatorUserNewComponent,
        canActivate: [AuthGuard, AdminGuard],
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
