import { TestBed } from '@angular/core/testing';

import { UnitSelectorRepositoryService } from './unit-selector-repository.service';

describe('UnitSelectorRepositoryService', () => {
  let service: UnitSelectorRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitSelectorRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
