import { SpecialRule } from "./special-rules/special-rule.interface";

export interface Faction {
  id: string;
  name: string;
  specialRules: ArmySpecialRule[];
}

export interface ArmySpecialRule extends SpecialRule {
  selectable?: boolean;
}

export const factionLibrary: Faction[] = [
  {
    id: 'US',
    name: 'United States',
    specialRules: [
      {
        id: 'FIMA',
        name: 'Fire and Manoeuvre',
        shortDescription: '1 Bonus dice per 3 rifles/carbines',
        description: 'All rifle/carbine-armed infantry units roll bonus dice when shooting. For every three men shooting rifles/carbines roll one extra die - so four riflemen would roll one extra die, for example. These extra shots can be assumed to come from any of the men shooting.' },
      {
        id: 'GYST',
        name: 'Gyro-Stabilisers',
        shortDescription: 'No -1 to hit penalty if veteran',
        description: 'When a weapon...'
       },
       {
        id: 'AISU',
        name: 'Air Superiority',
        shortDescription: 'May call air-strike twice instead of once',
        description: 'The forward air observer unit may...'
       },
       {
        id: 'MOCO',
        name: 'Modern Communications',
        shortDescription: 'No -1 penalty when moving from reserve onto the table',
        description: 'When units take an order...'
       }
    ],
  },
  {
    id: 'GER',
    name: 'Germany',
    specialRules: [
      {
        id: 'BLTZ',
        name: 'Fire and Manoeuvre',
        shortDescription: 'Additional order in Snap to Action',
        description: 'German officers using...' },
      {
        id: 'INTR',
        name: 'Initiative Training',
        shortDescription: 'Replace NCO on a 2+',
        description: 'If an infantry squad\'s NCO is killed...'
       },
       {
        id: 'HTBZ',
        name: 'Hitlers Buzz Saw',
        shortDescription: 'All MMG and LMG have fire one additioanl shot',
        description: 'German light and medium...'
       }
    ],
  },
];
