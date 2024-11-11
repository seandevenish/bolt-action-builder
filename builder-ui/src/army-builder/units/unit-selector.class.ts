import { UnitType, UnitSubType } from './unit-type.enum';
import { Experience } from "./experience.enum";
import { SpecialRule } from '../special-rules/special-rule.interface';
import { Library } from './library.interface';
import { Weapon } from '../weapons/weapon.interface';

export interface IGeneralOptionSelector {
  id: string;
  description: string;
  specialRuleId?: string; // This option adds a rule
  specialRule?: SpecialRule;
  adjustMen?: number; // This option increases or decreases (negative) the number of men in the unit
  cost?: number; // This option has a specific cost
  costPerMan?: number;
  availableExperienceLevels?: Experience[]; // If supplied, limits the options to units of this experience
}

export interface IInfantryWeaponOption {
  weaponId: string;
  weapon?: Weapon;
  description: string | null;
  max: number;
  cost: number;
  secondary: boolean;
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

  public enrich(library: Library): void {
    this.options.forEach(o => o.specialRule = library.specialRules.find(r => r.id == o.specialRuleId));
  }
}

export class InfantryUnitSelector extends UnitSelector {
  keyPerson: string;
  baseWeaponId: string;
  baseWeapon?: Weapon;
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

  public override enrich(library: Library): void {
    super.enrich(library);
    this.baseWeapon = library.weapons.find(w => w.id == this.baseWeaponId);
    const options = [
      ...this.keyPersonWeaponOptions,
      ...this.generalWeaponOptions
    ];
    options.forEach(o => o.weapon = library.weapons.find(w => w.id == o.weaponId));
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
