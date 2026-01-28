import { Component, OnInit } from '@angular/core';
import { TranscriptionAnalyticsService } from '../../../services/analytics/transcription-analytics.service';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-transcriptions-per-day-line-chart',
  imports: [CommonModule, ChartModule, FormsModule, CalendarModule, ButtonModule],
  templateUrl: './transcriptions-per-day-line-chart.component.html',
  styleUrl: './transcriptions-per-day-line-chart.component.css'
})
export class TranscriptionsPerDayLineChartComponent implements OnInit {
  data: any;
  options: any;

  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  constructor(private analyticsService: TranscriptionAnalyticsService) {}

  ngOnInit() {
    this.loadChartData();
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

    this.analyticsService.getTranscriptionsGroupedByDay(filter).subscribe((result) => {
      this.data = {
        labels: result.map(r => this.formatDateLabel(r.date)),
        datasets: [
          {
            label: 'Transcripciones por dia',
            data: result.map(r => r.count),
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#3b82f6',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4
          }
        ]
      };

      this.options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Transcripciones creadas por dia',
            color: '#e2e8f0',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 32, 46, 0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#2d3748',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: any) => `Transcripciones: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8',
              maxRotation: 45,
              minRotation: 45
            },
            grid: { color: 'rgba(45, 55, 72, 0.5)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(45, 55, 72, 0.5)' }
          }
        }
      };
    });
  }

  /**
   * Formats a date string from YYYY-MM-DD to DD/MM/YY using system timezone.
   */
  private formatDateLabel(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }
}