export class Army {
  name: string;
  factionId: string;
  faction: Faction;

  constructor(name: string, factionId: string) {
    this.name = name;
    this.factionId = factionId;
  }

  loadProperties((factionLibrary: Faction[]): void {
    this.faction = factionLibrary.find(f => f.id === this.factionId) || null;
  }
}

export interface SpecialRule {
  name: string;
  rule: string;
}

export interface Faction {
  id: string;
  name: string;
  specialRules: SpecialRule[];
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
