import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionNewComponent } from './transcription-new.component';

describe('SpeechToTextComponent', () => {
  let component: TranscriptionNewComponent;
  let fixture: ComponentFixture<TranscriptionNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranscriptionNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranscriptionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
