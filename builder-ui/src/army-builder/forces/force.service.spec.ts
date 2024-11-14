import { TestBed } from '@angular/core/testing';

import { ForceService } from './force.service';

describe('ForceService', () => {
  let service: ForceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
