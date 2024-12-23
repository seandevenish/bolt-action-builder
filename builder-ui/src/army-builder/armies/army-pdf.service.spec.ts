import { TestBed } from '@angular/core/testing';

import { ArmyPdfService } from './army-pdf.service';

describe('ArmyPdfService', () => {
  let service: ArmyPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArmyPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
