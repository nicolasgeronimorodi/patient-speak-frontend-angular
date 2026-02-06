import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranscriptionAnalyticsService } from '../../../services/analytics/transcription-analytics.service';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbService } from '../../../services/breadcrumb.service';

@Component({
  selector: 'app-transcriptions-by-category-chart',
  imports: [CommonModule, ChartModule, FormsModule, DatePickerModule, ButtonModule],
  templateUrl: './transcriptions-by-category-chart.component.html',
  styleUrl: './transcriptions-by-category-chart.component.css'
})
export class TranscriptionsByCategoryChartComponent implements OnInit, OnDestroy {
  chartData: any;
  chartOptions: any;

  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  private readonly chartColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(251, 146, 60, 0.8)'
  ];

  private readonly borderColors = [
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#06b6d4',
    '#ef4444',
    '#22c55e',
    '#a855f7',
    '#fb923c'
  ];

  constructor(
    private analyticsService: TranscriptionAnalyticsService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Inicio', route: '/home', icon: 'home' },
      { label: 'Reportes', route: null, icon: 'assessment' },
      { label: 'Reporte por categoria', route: '/reports/category', icon: 'pie_chart' }
    ]);
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  onDateFilterChange(): void {
    this.loadChartData();
  }

  clearFilters(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.loadChartData();
  }

  get hasActiveFilters(): boolean {
    return this.dateFrom !== null || this.dateTo !== null;
  }

  private loadChartData(): void {
    const filter = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };

    this.analyticsService.getTranscriptionCountsByCategory(filter).subscribe(data => {
      const dataLength = data.length;

      this.chartData = {
        labels: data.map(d => d.category),
        datasets: [
          {
            label: 'Cantidad de Transcripciones',
            data: data.map(d => d.count),
            backgroundColor: this.getColors(dataLength, this.chartColors),
            borderColor: this.getColors(dataLength, this.borderColors),
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: this.getColors(dataLength, this.borderColors),
            barPercentage: 0.4,
            categoryPercentage: 0.5
          }
        ]
      };

      this.chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { size: 16 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 32, 46, 0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#2d3748',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 14 },
              precision: 0
            },
            grid: {
              color: 'rgba(45, 55, 72, 0.3)',
              drawBorder: false
            },
            beginAtZero: true
          },
          y: {
            ticks: {
              color: '#94a3b8',
              font: { size: 14 }
            },
            grid: {
              color: 'rgba(45, 55, 72, 0.3)',
              drawBorder: false
            }
          }
        }
      };
    });
  }

  /**
   * Generates an array of colors cycling through the palette.
   */
  private getColors(count: number, palette: string[]): string[] {
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}