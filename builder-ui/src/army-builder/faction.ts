export interface Faction {
  id: string;
  name: string;
  specialRules: SpecialRule[];
}

export interface SpecialRule {
  id: string;
  name: string;
  shortRule: string;
  rule: string;
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
        shortRule: '1 Bonus dice per 3 rifles/carbines',
        rule: 'All rifle/carbine-armed infantry units roll bonus dice when shooting. For every three men shooting rifles/carbines roll one extra die - so four riflemen would roll one extra die, for example. These extra shots can be assumed to come from any of the men shooting.' },
      {
        id: 'GYST',
        name: 'Gyro-Stabilisers',
        shortRule: 'No -1 to hit penalty if veteran',
        rule: 'When a weapon...'
       },
       {
        id: 'AISU',
        name: 'Air Superiority',
        shortRule: 'May call air-strike twice instead of once',
        rule: 'The forward air observer unit may...'
       },
       {
        id: 'MOCO',
        name: 'Modern Communications',
        shortRule: 'No -1 penalty when moving from reserve onto the table',
        rule: 'When units take an order...'
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
        shortRule: 'Additional order in Snap to Action',
        rule: 'German officers using...' },
      {
        id: 'INTR',
        name: 'Initiative Training',
        shortRule: 'Replace NCO on a 2+',
        rule: 'If an infantry squad\'s NCO is killed...'
       },
       {
        id: 'AISU',
        name: 'Air Superiority',
        shortRule: 'May call air-strike twice instead of once',
        rule: 'The forward air observer unit may...'
       },
       {
        id: 'HTBZ',
        name: 'Hitlers Buzz Saw',
        shortRule: 'All MMG and LMG have fire one additioanl shot',
        rule: 'German light and medium...'
       }
    ],
  },
];
