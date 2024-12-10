import { Library } from "./library.interface";
import { IInfantryWeaponOption } from "./unit-selector.class";
import { InfantryUnitSelector } from './infantry-unit-selector.class';
import { IUnitModel, IUnitWeaponDetail, Unit } from "./unit.class";
import { SpecialRule } from "../special-rules/special-rule.interface";
import { concat } from "rxjs";


export interface IInfantryUnitModel extends IUnitModel {
  men: number,
  keyPersonWeaponId: string | null,
  generalWeaponIds: Record<string, number>;
}

export class InfantryUnit extends Unit<InfantryUnitSelector> {
  override men: number;
  keyPersonWeaponId: string | null = null;
  get keyPersonWeapon() {
    return this.library.weapons.find(w => w.id == this.keyPersonWeaponId) ?? null;
  }
  generalWeaponIds: Record<string, number> = {};

  keyPersonWeaponOptions: (IInfantryWeaponOption | any)[];

  constructor(data: IInfantryUnitModel, library: Library) {
    super(data, library);
    this.men = data.men;
    if (data.keyPersonWeaponId) this.keyPersonWeaponId = data.keyPersonWeaponId;
    if (data.generalWeaponIds) this.generalWeaponIds = data.generalWeaponIds;
    this.keyPersonWeaponOptions = this.selector.keyPersonWeaponOptions.map(o => ({
      ...o,
      weapon: library.weapons.find(w => w.id == o.weaponId)
    }));
    this.refresh();
  }

  public override get countString(): string {
    return this.men + ' ' + (this.men == 1 ? 'man' : 'men');
  }

  protected override validate(): string[] | null {
    const library = this.library;
    const errors = super.validate() ?? [];
    if (this.selector == null) throw Error('Selector missing, unable to validate.');
    // Validate Experience
    if (this.selector.cost != null && !this.availableExperienceLevels.some(a => a == this.experience))
      errors.push(`This unit cannot be ${this.experience}`);
    // Validate min/max
    if (this.men > this.selector.maxMen) errors.push(`You cannot have more than ${this.selector.maxMen} men in this unit.`);
    if (this.men < this.selector.baseMen) errors.push(`You cannot have less than ${this.selector.baseMen} men in this unit.`);
    // Validate Key Person Weapon Options
    if (!!this.keyPersonWeapon && !this.selector.keyPersonWeaponOptions.map(o => o.weaponId).some(i => i == this.keyPersonWeapon!.id))
      errors.push(`Invalid weapon choice for ${this.selector.keyPerson}`);
    // Validate Weapon Options
    const nonKeyPersonMen = this.men - 1;
    let menForWeaponAddons = this.calculateMenUsedByWeaponAddons();
    if (this.generalWeaponIds) {
      Object.keys(this.generalWeaponIds).forEach(k => {
        const qty = this.generalWeaponIds![k];
        const selector = this.selector?.generalWeaponOptions.find(o => o.weaponId);
        const weapon = library.weapons.find(w => w.id == k);
        if (!selector || !weapon) {
          errors.push(`Invalid weapons present`);
          return;
        }
        if (qty > selector.max) errors.push(`You have ${qty - selector.max} more ${weapon.name}s than this unit allows.`);
      });
      if (menForWeaponAddons > nonKeyPersonMen)
        errors.push(`You have weapon selections that require ${menForWeaponAddons} men but you only have ${nonKeyPersonMen} men available to use them.`);
    }
    return errors.length ? errors : null;
  }

  private calculateMenUsedByWeaponAddons() {
    let menForWeaponAddons = 0;
    if (this.generalWeaponIds) {
      Object.keys(this.generalWeaponIds).forEach(k => {
        const qty = this.generalWeaponIds![k];
        const selector = this.selector?.generalWeaponOptions.find(o => o.weaponId);
        const weapon = this.library.weapons.find(w => w.id == k);
        menForWeaponAddons += (weapon?.crew ?? 1) * qty;
      });
    }
    return menForWeaponAddons;
  }

  protected override calculateCost() {
    if (this.selector == null) throw Error('Selector missing, unable to calculate cost.');
    const base = this.selector.cost[this.experience];
    const perMan = (this.men - this.selector.baseMen) * this.selector.costPerMan[this.experience];
    const options = this.selector.options.reduce((v, o) => {
      const selected = this.optionIds.some(s => s == o.id);
      if (!selected) return v;
      return v + (o.costPerMan ?? 0) * this.men + (o.cost ?? 0);
    }, 0);
    const keyPersonWeapon = this.selector.keyPersonWeaponOptions.find(o => o.weaponId == this.keyPersonWeapon?.id)?.cost ?? 0;
    const weaponOptions = this.selector.generalWeaponOptions.reduce((v, o) => {
      const qty = this.generalWeaponIds?.[o.weaponId] ?? 0;
      return v + (qty * o.cost);
    }, 0);
    return base + perMan + options + keyPersonWeapon + weaponOptions;
  }

  protected override calculateWeaponSummary(): IUnitWeaponDetail[] {
    const ncoWeapon = this.keyPersonWeapon ?? this.selector.baseWeapon!;
    const ncoDetail: IUnitWeaponDetail = {
      qty: 1,
      role: this.selector.keyPerson,
      description: this.keyPersonWeaponOptions.find(o => o.weaponId == ncoWeapon.id)?.description ?? ncoWeapon.name,
      weapon: this.keyPersonWeapon ?? this.selector.baseWeapon!,
      special: ncoWeapon?.specialRules?.map(r => r.name).join(", ") ?? ""
    };

    const otherWeapons = this.selector.generalWeaponOptions.map(w => {
      const qty = this.generalWeaponIds[w.weaponId];
      const weapon = w.weapon!;
      return {
        qty: qty,
        role: w.weapon?.crew == 0 ? null : qty == 1 ? 'man' : 'men',
        description: weapon.name,
        weapon: weapon,
        special: weapon?.specialRules?.map(r => r.name).join(", ") ?? ""
      }
    });

    const baseWeapon = this.selector.baseWeapon!;
    const baseQty = this.men - 1 - this.calculateMenUsedByWeaponAddons();
    const baseWeaponDetail: IUnitWeaponDetail = {
      qty: baseQty,
      role: baseQty == 1 ? 'man' : 'men',
      description: baseWeapon.name,
      weapon: baseWeapon,
      special: baseWeapon?.specialRules?.map(r => r.name).join(", ") ?? ""
    }

    return [
      ncoDetail,
      baseWeaponDetail,
      ...otherWeapons
    ].filter(r => r.qty > 0);

  }

  public override toStoredObject(): IInfantryUnitModel {
    return {
      ...super.toStoredObject(),
      men: this.men,
      keyPersonWeaponId: this.keyPersonWeaponId ?? null,
      generalWeaponIds: this.generalWeaponIds
    };
  }

}
