import { TestBed } from '@angular/core/testing';

import { ForceSelectorRepositoryService } from './force-selector-repository.service';

describe('ForceSelectorRepositoryService', () => {
  let service: ForceSelectorRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForceSelectorRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
