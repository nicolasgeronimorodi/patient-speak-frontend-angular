import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranscriptionsByCategoryChartComponent } from '../charts/transcriptions-by-category-chart/transcriptions-by-category-chart.component';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Dashboard', route: null, icon: 'dashboard' }
    ]);
  }

  navigateTo(path: string) {
    this.router.navigate([`/dashboard/charts/${path}`]);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
