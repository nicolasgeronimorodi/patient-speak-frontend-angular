import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranscriptionAnalyticsService } from '../../../services/analytics/transcription-analytics.service';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transcriptions-per-day-line-chart',
  imports: [CommonModule, ChartModule],
  templateUrl: './transcriptions-per-day-line-chart.component.html',
  styleUrl: './transcriptions-per-day-line-chart.component.css'
})
export class TranscriptionsPerDayLineChartComponent implements OnInit, OnDestroy {
  data: any;
  options: any;

  constructor(private analyticsService: TranscriptionAnalyticsService, private breadcrumbService: BreadcrumbService, private router: Router) {}

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
        label: 'Gráfico de transcripciones por día',
      },
    ]);
  }


  ngOnInit() {
    this.buildBreadcrumb();
    this.analyticsService.getTranscriptionsGroupedByDay().subscribe((result) => {
      this.data = {
        labels: result.map(r => r.date),
        datasets: [
          {
            label: 'Transcripciones por día',
            data: result.map(r => r.count),
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          }
        ]
      };

      this.options = {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Transcripciones creadas por día' }
        }
      };
    });
  }
  
  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }
}