import { Routes } from '@angular/router';
import { LoginComponent } from './components/layout/login/login.component';
import { RegisterComponent } from './components/layout/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { OperatorUserNewComponent } from './components/admin-management/operator-user-new/operator-user-new.component';
import { ProtectedRoutesLayoutComponent } from './components/layout/protected-routes-layout/protected-routes-layout.component';
import { AuthenticationLayoutComponent } from './components/layout/authentication-layout/authentication-layout.component';
import { NotFoundComponent } from './components/layout/not-found-layout/not-found.component';
import { TranscriptionQueryComponent } from './components/transcriptions/transcriptions-query/transcription-query.component';
import { transcriptionDetailAccessGuard } from './guards/transcription-detail-access.guard';
import { TranscriptionDetailComponent } from './components/transcription-detail/transcription-detail.component';
import { ObservationsQueryComponent } from './components/observations-query/observations-query.component';
import { TagNewComponent } from './components/tag-new/tag-new.component';
import { tagNewAccessGuard } from './guards/tag-new-access.guard';
import { TagQueryComponent } from './components/tag-query/tag-query.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TranscriptionsPerDayLineChartComponent } from './components/charts/transcriptions-per-day-line-chart/transcriptions-per-day-line-chart.component';
import { TranscriptionsByCategoryChartComponent } from './components/charts/transcriptions-by-category-chart/transcriptions-by-category-chart.component';

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
        canActivate: [transcriptionDetailAccessGuard],
      },
      {
        path: 'transcriptions/:id/observations',
        component: ObservationsQueryComponent,
      },

      { path: 'transcriptions', component: TranscriptionQueryComponent },
      {
        path: 'admin/users',
        component: OperatorUserNewComponent,
        canActivate: [AuthGuard, adminGuard],
      },
      {
        path: 'tags/new',
        component: TagNewComponent,
        canActivate: [tagNewAccessGuard],
      },
      {
        path: 'tags',
        component: TagQueryComponent,
      },
      {
        path: 'dashboard/charts/transcriptions-per-day',
        component: TranscriptionsPerDayLineChartComponent,
        canActivate: [AuthGuard, adminGuard],
      },
      {
        path: 'dashboard/charts/transcriptions-by-tag',
        component: TranscriptionsByCategoryChartComponent,
        canActivate: [AuthGuard, adminGuard],
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
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
