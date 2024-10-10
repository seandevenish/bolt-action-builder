import { TestBed } from '@angular/core/testing';

import { SpecialRulesRepositoryService } from './special-rules-repository.service';

describe('SpecialRulesRepositoryService', () => {
  let service: SpecialRulesRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecialRulesRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
