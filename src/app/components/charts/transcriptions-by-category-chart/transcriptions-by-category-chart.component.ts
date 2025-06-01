import { Component, OnInit } from '@angular/core';
import { TranscriptionAnalyticsService } from '../../../services/analytics/transcription-analytics.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-transcriptions-by-category-chart',
  imports: [ChartModule],
  templateUrl: './transcriptions-by-category-chart.component.html',
  styleUrl: './transcriptions-by-category-chart.component.css'
})
export class TranscriptionsByCategoryChartComponent implements OnInit {
  chartData: any;
  chartOptions: any;

  constructor(private analyticsService: TranscriptionAnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getTranscriptionCountsByCategory().subscribe(data => {
      this.chartData = {
        labels: data.map(d => d.category),
        datasets: [
          {
            label: 'Cantidad de Transcripciones',
            data: data.map(d => d.count),
            backgroundColor: '#42A5F5'
          }
        ]
      };

      this.chartOptions = {
        plugins: {
          legend: {
            labels: {
              color: '#495057'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#495057'
            },
            grid: {
              color: '#ebedef'
            }
          },
          y: {
            ticks: {
              color: '#495057'
            },
            grid: {
              color: '#ebedef'
            },
            beginAtZero: true
          }
        }
      };
    });
  }
}