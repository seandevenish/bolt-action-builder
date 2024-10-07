export interface Faction {
  id: string;
  name: string;
  specialRules: SpecialRule[];
}

export interface SpecialRule {
  name: string;
  rule: string;
}

export const factionLibrary: Faction[] = [
  {
    id: 'US',
    name: 'United States',
    specialRules: [
      { name: 'Rule 1', rule: 'This is the description of rule 1' },
      { name: 'Rule 2', rule: 'This is the description of rule 2' },
    ],
  },
  {
    id: 'GER',
    name: 'Germany',
    specialRules: [
      { name: 'Rule 3', rule: 'This is the description of rule 3' },
    ],
  },
];
