import { TestBed } from '@angular/core/testing';

import { SpeechToTextService } from './web-speech-recognition.service';

describe('SpeechToTextService', () => {
  let service: SpeechToTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechToTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
