import { Weapon } from "../weapons/weapon.interface";
import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { UnitSelector, IGeneralOptionSelector } from "./unit-selector.class";
import { UnitType, UnitSubType } from "./unit-type.enum";

export interface IVehicleWeapon {
  id: string;
  weaponId: string;
  weapon?: Weapon;
  description: string;
  specialRuleIds?: string[];
  qty: number;
}

export interface IVehicleWeaponOption {
  id: string;
  optionSetId: string;
  replaceIds: string[];
  weapons: IVehicleWeapon[];
  cost: number;
  description: string;
}

export class VehicleUnitSelector extends UnitSelector {

  readonly transportCapacity: number = 0;
  readonly baseWeapons: IVehicleWeapon[] = [];
  readonly weaponOptions: IVehicleWeaponOption[] = [];
  readonly damageValue: number;

  constructor(data: {
    id: string;
    name: string;
    unitType: UnitType;
    subType?: UnitSubType;
    transportCapacity?: number;
    baseWeapons?: IVehicleWeapon[];
    weaponOptions?: IVehicleWeaponOption[];
    damageValue: number;
    cost: Record<Experience, number>;
    specialRuleIds?: string[];
    options?: IGeneralOptionSelector[];
  }) {
    super(data);
    this.transportCapacity = data.transportCapacity ?? 0;
    this.baseWeapons = data.baseWeapons ?? [];
    this.weaponOptions = data.weaponOptions ?? [];
    this.damageValue = data.damageValue;
  }

  public override enrich(library: Library): void {
    super.enrich(library);
    const weapons = this.baseWeapons.concat(this.weaponOptions.flatMap(o => o.weapons ?? []));
    weapons.forEach(b => b.weapon = library.weapons.find(w => w.id == b.weaponId));
  }

}
