import { TestBed } from '@angular/core/testing';

import { PlatoonSelectorRepositoryService } from './platoon-selector-repository.service';

describe('PlatoonSelectorRepositoryService', () => {
  let service: PlatoonSelectorRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatoonSelectorRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
