import { Observable, of } from 'rxjs';
import { ForceSelector } from './force-selector';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ForceSelectorRepositoryService {

  private readonly forceLibrary: ForceSelector[] = [
    new ForceSelector('Generic',
      [
        'RIFL',
        'HVWP',
        'ENGR',
        'ARMR',
        'ARTL',
        'RECE'
      ],
      [
        'US',
        'GER'
      ])
  ];

  constructor() { }

  getForceSelectorsForFaction(faction: string): Observable<ForceSelector[]> {
    return of(this.forceLibrary);
  }

  getForceSelector(forceSelectorId: string): Observable<ForceSelector> {
    return of(this.forceLibrary[0]);
  }
}
