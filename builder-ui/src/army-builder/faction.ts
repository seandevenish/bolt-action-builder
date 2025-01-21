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
    id: 'GB',
    name: 'Great Britain',
    specialRules: [],
  },
  {
    id: 'SOV',
    name: 'Soviet Union',
    specialRules: [],
  },
  {
    id: 'JAP',
    name: 'Japan',
    specialRules: [
      {
        id: 'DTHBEFDSH',
        name: 'Death before Dishonour',
        shortDescription: 'All units get fanatics, infantry/artillery pass morale checks after assault by enemy tanks',
        description: 'Every unit in this list has the Fanatics special rule. In addition, infantry and artillery units automatically pass morale checks for being assaulted by enemy tanks (note that artillery pieces are still destroyed as normal).'
      },
      {
        id: 'BANZAI',
        name: 'Banzai Charge',
        shortDescription: 'Reroll failed order test to assault',
        description: 'If the unit is ordered to assault and fails its order test to Run, measure the range to the target, if the unit was in range, you can re-roll the failed Order test to assault.'
      },      {
        id: 'SHOWLOY',
        name: 'Show your Loyalty!',
        shortDescription: 'IJA Armies can include a single Kempeitai for each rifle platoon',
        description: 'IJA Armies can include a single Kempeitai political officer for each rifle platoon. Kempeitai offices don\'t confer any morale bonus to nearby troops. However, the presence of these feared officers is useful in steeling the nerve of untied units, such as militia. When a green friendly Japanese unit within 6" of the Kempeitai officer rolls for its Green special rule, the player may re-roll the result.'
      }
    ],
  },
];
