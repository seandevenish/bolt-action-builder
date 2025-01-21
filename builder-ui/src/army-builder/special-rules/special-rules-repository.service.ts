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
      { id: 'US_EXTRA_MMG', name: 'Extra Selection', shortDescription: 'Take 3 MMGs per selection', description: 'You may take up to 3 medium machine guns as 1 machine gun selection' },
      { id: 'GUN_SHIELD', name: 'Gun Shield', shortDescription: '', description: ''},
      { id: 'FLAK', name: 'Flak', shortDescription: '', description: ''},
      { id: 'CUMBSEROME', name: 'Cumbersome', shortDescription: 'Counts as heavy for movement', description: 'Counts as a heavy gun for the purposes of movement'},
      { id: 'SNIPER', name: 'Sniper', shortDescription: '', description: '' },
      { id: 'INFILTRATOR', name: 'Infiltrator', shortDescription: '', description: '' },
      { id: 'STUBBORN', name: 'Stubborn', shortDescription: '', description: '' },
      { id: 'BICYCLES', name: 'Bicycles', shortDescription: '', description: '' },
      { id: 'BEHIND', name: 'Behind Enemy Lines', shortDescription: 'When outflanking, ignore -1 modifier to the Order test for coming onto the table', description: '' },
      { id: 'SCARY', name: 'Scary Blighters!', shortDescription: 'Enemy unit fighting in close combat halves number of attacks (rounding up)', description: '' },
      { id: 'FANATICS', name: 'Fanatics', shortDescription: '', description: '' },
      { id: '25PDR_AT', name: '25 Pdr AT Shell', shortDescription: 'Howitzer may fire AT shell, counts as Light Anti-Tank', description: '' },
      { id: 'IMPROVISED_ROLE', name: 'Improvised Role', shortDescription: 'Each shot against a ground target gains 1 pin marker', description: '' },
      { id: 'COMMAND_VEHICLE', name: 'Command Vehicle', shortDescription: '+1 Morale Bonus within 12", and \'You men, snap to action!\' to one friendly vehicle within 12"', description: ''},
      { id: 'RECCE', name: 'Recce', shortDescription: '', description: '' },
      { id: 'SLOW', name: 'Slow', shortDescription: '', description: '' },
      { id: 'VULNERABLE', name: 'Vulnerable', shortDescription: '+1 pen to shots to side and rear', description: 'Because of the riveted construction, all shots to the side and rear of the vehicle get an addition +1 penetration modifier (i.e. in total, +2 for side hits and +3 for rear hits' },
      { id: 'REINFORCED_FRONT', name: 'Reinforced Front Armour', shortDescription: '', description: '' },
      { id: 'MEDICAL_VEHICLE', name: 'Medical Vehicle', shortDescription: '', description: ''},
      { id: 'OPEN_TOPPED', name: 'Open-topped', shortDescription: '', description: ''},
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
      { id: 'CAVALRY', name: 'Cavalry', shortDescription: '9" advance, 18" run, no entering or assaulting buildings, no boarding transports, no Down, saves reduced by 1, recce at normal speed. Tough Fighters, 2D6 for regroup move.', description: '' },
      { id: 'SHOWLOY', name: 'Show your Loyalty!', shortDescription: 'Reroll green result if within 6"', description: '' },
      { id: 'KAMIKAZE', name: 'Kamikaze', shortDescription: 'On moving into contact, remove unit and resolve hit immediately', description: ''},
      { id: 'ONEMANTURRET', name: 'One-man Turret', shortDescription: '', description: '' },
      { id: 'AMPHIBIOUS', name: 'Amphibious', shortDescription: '', description: '' }
    ];

  }
}
