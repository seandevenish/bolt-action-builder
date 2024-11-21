import { Weapon } from "../weapons/weapon.interface";
import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { UnitSelector, IGeneralOptionSelector } from "./unit-selector.class";
import { UnitType, UnitSubType } from "./unit-type.enum";


export class TeamUnitSelector extends UnitSelector {
  readonly baseWeaponQty: number = 1;
  readonly baseWeaponId: string;
  readonly baseWeaponDescription: string | null;
  baseWeapon?: Weapon;
  readonly baseMen: number;

  constructor(data: {
    id: string;
    name: string;
    unitType: UnitType;
    baseWeaponQty?: number;
    baseWeaponId: string;
    baseWeaponDescription?: string;
    baseMen: number;
    subType?: UnitSubType;
    cost: Record<Experience, number>;
    specialRuleIds?: string[];
    options?: IGeneralOptionSelector[];
  }) {
    super(data);
    this.baseWeaponQty = data.baseWeaponQty ?? 1;
    this.baseWeaponId = data.baseWeaponId;
    this.baseWeaponDescription = data.baseWeaponDescription ?? null;
    this.baseMen = data.baseMen;
  }

  public override enrich(library: Library): void {
    super.enrich(library);
    this.baseWeapon = library.weapons.find(w => w.id == this.baseWeaponId);
  }

}
