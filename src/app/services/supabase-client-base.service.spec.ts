import { TestBed } from '@angular/core/testing';

import { SupabaseClientBaseService } from './supabase-client-base.service';

describe('SupabaseClientBaseService', () => {
  let service: SupabaseClientBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseClientBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
