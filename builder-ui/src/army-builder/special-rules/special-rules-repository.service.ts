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
      { id: 'EXTRASELECTION', name: 'Extrta Selection', shortDescription: 'Take 3 MMGs per selection', description: 'You may take up to 3 medium machine guns as 1 machine gun selection' },
      { id: 'STUBBORN', name: 'Stubborn', shortDescription: '', description: '' },
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
      { id: 'FLAMETHROWER', name: 'Flamethrower', shortDescription: '', description: '' },
      { id: 'RANGERS', name: 'Rangers lead the way!', shortDescription: 'Free run move before first turn', description: 'Units of Rangers are allowed to make a <em>Run</em> move after both sides have finished set-up, but before the first turn of the game. During this move, the unit cannot assault enemy units, and cannot be targeted by enemies in <em>Ambush</em>.' },
    ];

  }
}
