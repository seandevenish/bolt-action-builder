import { UnitType, UnitSubType } from './unit-type.enum';
import { Experience } from "./experience";

export interface IGeneralOptionSelector {
  id: string;
  description: string;
  specialRuleId?: string; // This option adds a rule
  adjustMen?: number; // This option increases or decreases (negative) the number of men in the unit
  cost?: number; // This option has a specific cost
  costPerMan?: number;
  availableExperienceLevels?: Experience[]; // If supplied, limits the options to units of this experience
}

export interface IInfantryWeaponOption {
  weaponId: string;
  description: string;
  max: number;
  cost: number;
}

export interface IVehicleWeaponOption {
  weaponId: string;
  removeWeaponIds: string[];
}

export class UnitSelector {
  id: string;
  name: string;
  unitType: UnitType;
  subType?: UnitSubType;
  cost: Record<Experience, number>;
  specialRuleIds?: string[] = [];
  options: IGeneralOptionSelector[] = [];

  get availableExperienceLevels(): Experience[] {
    return Object.keys(this.cost)
      .map(key => Experience[key as keyof typeof Experience]); // Map string keys to enum values;
  }

  constructor(data: {
    id: string;
    name: string;
    unitType: UnitType;
    subType?: UnitSubType;
    cost: Record<Experience, number>;
    specialRuleIds?: string[];
    options?: IGeneralOptionSelector[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.unitType = data.unitType;
    this.subType = data.subType;
    this.cost = data.cost;
    this.specialRuleIds = data.specialRuleIds ?? [];
    this.options = data.options || [];
  }
}

export class InfantryUnitSelector extends UnitSelector {
  keyPerson: string;
  baseWeaponId: string;
  keyPersonWeaponOptions: IInfantryWeaponOption[] = [];
  generalWeaponOptions: IInfantryWeaponOption[] = [];
  costPerMan: Record<Experience, number>;
  baseMen: number;
  maxMen: number;

  constructor(data: {
    id: string;
    name: string;
    unitType: UnitType;
    keyPerson: string;
    baseWeaponId: string;
    keyPersonWeaponOptions?: IInfantryWeaponOption[];
    generalWeaponOptions?: IInfantryWeaponOption[];
    costPerMan: Record<Experience, number>;
    baseMen: number;
    maxMen: number;
    subType?: UnitSubType;
    availableExperienceLevels?: Experience[]
    cost: Record<Experience, number>;
    specialRuleIds?: string[];
    options?: IGeneralOptionSelector[];
  }) {
    super(data);
    this.keyPerson = data.keyPerson;
    this.baseWeaponId = data.baseWeaponId;
    this.keyPersonWeaponOptions = data.keyPersonWeaponOptions || [];
    this.generalWeaponOptions = data.generalWeaponOptions || [];
    this.costPerMan = data.costPerMan;
    this.baseMen = data.baseMen;
    this.maxMen = data.maxMen;
  }


}

export class WeaponTeamSelector extends UnitSelector {
  // weaponId: string;
  // baseMen: number;
  // generalWeaponOptions: IWeaponOption[];
}

export class VehicleSelector extends UnitSelector {
  // weaponIds: Record<string, string>;
  // generalWeaponOptions: IWeaponOption[];
}
