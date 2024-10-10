export interface SpecialRule {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
}

export const SpecialRulesLibrary: SpecialRule[] = [
  { id: 'TANKHUNT', name: 'Tank Hunters', shortDescription: 'No penalty on morale check and full damage', description: '...' },
  { id: 'TOUGH', name: 'Tough Fighters', shortDescription: '...', description: '...' },

  // Add more special rules as needed...
];
