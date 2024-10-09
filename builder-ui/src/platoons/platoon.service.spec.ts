import { TestBed } from '@angular/core/testing';

import { PlatoonService } from './platoon.service';

describe('PlatoonService', () => {
  let service: PlatoonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatoonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
