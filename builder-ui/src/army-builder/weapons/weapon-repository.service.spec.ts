import { TestBed } from '@angular/core/testing';

import { WeaponRepositoryService } from './weapon-repository.service';

describe('WeaponRepositoryService', () => {
  let service: WeaponRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeaponRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
