import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionsByCategoryChartComponent } from './transcriptions-by-category-chart.component';

describe('TranscriptionsByCategoryChartComponent', () => {
  let component: TranscriptionsByCategoryChartComponent;
  let fixture: ComponentFixture<TranscriptionsByCategoryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranscriptionsByCategoryChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranscriptionsByCategoryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
