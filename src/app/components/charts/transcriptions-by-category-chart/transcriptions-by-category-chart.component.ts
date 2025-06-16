import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranscriptionAnalyticsService } from '../../../services/analytics/transcription-analytics.service';
import { ChartModule } from 'primeng/chart';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transcriptions-by-category-chart',
  imports: [ChartModule],
  templateUrl: './transcriptions-by-category-chart.component.html',
  styleUrl: './transcriptions-by-category-chart.component.css',
})
export class TranscriptionsByCategoryChartComponent
  implements OnInit, OnDestroy
{
  chartData: any;
  chartOptions: any;

  constructor(
    private analyticsService: TranscriptionAnalyticsService,
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {}

  buildBreadcrumb() {
    this.breadcrumbService.buildBreadcrumb([
      {
        label: 'Home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Dashboard',
      },
      {
        label: 'Gráfico de transcripciones por categoría',
      },
    ]);
  }

  ngOnInit(): void {
    this.buildBreadcrumb();
    this.analyticsService
      .getTranscriptionCountsByCategory()
      .subscribe((data) => {
        this.chartData = {
          labels: data.map((d) => d.category),
          datasets: [
            {
              label: 'Cantidad de Transcripciones',
              data: data.map((d) => d.count),
              backgroundColor: '#42A5F5',
            },
          ],
        };

        this.chartOptions = {
          plugins: {
            legend: {
              labels: {
                color: '#495057',
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#495057',
              },
              grid: {
                color: '#ebedef',
              },
            },
            y: {
              ticks: {
                color: '#495057',
              },
              grid: {
                color: '#ebedef',
              },
              beginAtZero: true,
            },
          },
        };
      });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}
