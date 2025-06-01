import { Component } from '@angular/core';
import { TranscriptionsByCategoryChartComponent } from '../charts/transcriptions-by-category-chart/transcriptions-by-category-chart.component';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([`/dashboard/charts/${path}`]);
  }
}
