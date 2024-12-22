import { Weapon } from "../weapons/weapon.interface";
import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { RuleBook } from "./rulebook.enum";
import { UnitSelector, IInfantryWeaponOption, IGeneralOptionSelector } from "./unit-selector.class";
import { UnitType, UnitSubType } from "./unit-type.enum";


export class InfantryUnitSelector extends UnitSelector {
  readonly keyPerson: string;
  readonly baseWeaponId: string;
  baseWeapon?: Weapon;
  readonly keyPersonWeaponOptions: IInfantryWeaponOption[] = [];
  readonly generalWeaponOptions: IInfantryWeaponOption[] = [];
  readonly costPerMan: Record<Experience, number>;
  readonly baseMen: number;
  readonly maxMen: number;

  constructor(data: {
    id: string;
    name: string;
    unitType: UnitType;
    subType?: UnitSubType;
    ruleBook: RuleBook;
    keyPerson: string;
    baseWeaponId: string;
    keyPersonWeaponOptions?: IInfantryWeaponOption[];
    generalWeaponOptions?: IInfantryWeaponOption[];
    costPerMan: Record<Experience, number>;
    baseMen: number;
    maxMen: number;
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
