import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationNewComponent } from './observation-new.component';

describe('ObservationNewComponent', () => {
  let component: ObservationNewComponent;
  let fixture: ComponentFixture<ObservationNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservationNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
