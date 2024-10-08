import { UnitType, UnitSubType } from './unit-type.enum';
import { VeterancyLevel } from "./veterancy-level";
import { Faction } from '../armies/faction';
import { SpecialRule } from './special-rule.interface';

export class UnitSelector {
  id: string;
  name: string;
  unitType: UnitType;
  subType?: UnitSubType;
  factions: Faction[];
  keyPerson: string; // e.g., 'NCO', 'Medic', 'Officer'
  minMen: number;
  maxMen: number;
  availableWeapons: string[]; // Additional weapons that can be assigned
  startingWeapon: string; // Weapon each man in the unit starts with
  costPerMan: Record<VeterancyLevel, number>; // Cost for each man based on veterancy level
  availableVeterancyLevels: VeterancyLevel[]; // Veterancy levels allowed for this unit
  specialRules: SpecialRule[];

  constructor(data: {
    id: string;
    name: string;
    unitType: UnitType;
    factions: Faction[];
    keyPerson: string;
    minMen: number;
    maxMen: number;
    startingWeapon: string;
    availableWeapons: string[];
    costPerMan: Record<VeterancyLevel, number>;
    availableVeterancyLevels: VeterancyLevel[];
    specialRules: SpecialRule[];
    subType?: UnitSubType;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.unitType = data.unitType;
    this.subType = data.subType;
    this.factions = data.factions;
    this.keyPerson = data.keyPerson;
    this.minMen = data.minMen;
    this.maxMen = data.maxMen;
    this.startingWeapon = data.startingWeapon;
    this.availableWeapons = data.availableWeapons;
    this.costPerMan = data.costPerMan;
    this.availableVeterancyLevels = data.availableVeterancyLevels;
    this.specialRules = data.specialRules;
  }
}
