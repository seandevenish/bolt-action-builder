import { Injectable } from '@angular/core';
import { SpecialRule } from './special-rule.interface';

@Injectable({
  providedIn: 'root'
})
export class SpecialRulesRepositoryService {

  constructor() { }

  getRules(): SpecialRule[] {
    return [
      { id: 'TANKHUNT', name: 'Tank Hunters', shortDescription: 'No penalty on morale check and full damage', description: '' },
      { id: 'TOUGH', name: 'Tough Fighters', shortDescription: '', description: '' },
      { id: 'SHAPED_CHARGE', name: 'Shaped Charge', shortDescription: '', description: '' },
      { id: 'ONE_SHOT', name: 'One-Shot', shortDescription: '', description: '' },
      { id: 'ASSAULT', name: 'Assault', shortDescription: '', description: '' },
      { id: 'TEAM', name: 'Team', shortDescription: '', description: '' },
      { id: 'FIXED', name: 'Fixed', shortDescription: '', description: '' },
      { id: 'HE_1', name: 'HE (1")', shortDescription: '', description: '' },
      { id: 'HE_2', name: 'HE (2")', shortDescription: '', description: '' },
      { id: 'HE_3', name: 'HE (3")', shortDescription: '', description: '' },
      { id: 'HE_4', name: 'HE (4")', shortDescription: '', description: '' },
      { id: 'INDIRECT_FIRE', name: 'Indirect Fire', shortDescription: '', description: '' },
      { id: 'FLAMETHROWER', name: 'Flamethrower', shortDescription: '', description: '' }
    ];

  }
}
