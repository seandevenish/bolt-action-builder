import { Subject } from "rxjs";
import { IFirestoreStorable } from "../../app/services/firestore-base-service.service";
import { SpecialRule } from "../special-rules/special-rule.interface";
import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { IInfantryWeaponOption, InfantryUnitSelector, UnitSelector } from "./unit-selector.class";

export interface IUnitModel extends IFirestoreStorable {
  selectorId: string;
  slotId: string;
  cost: number;
  experience: Experience;
  optionIds: string[];
}

export interface IInfantryUnitModel extends IUnitModel {
  men: number,
  keyPersonWeaponId: string | null,
  generalWeaponIds: Record<string, number>;
}

export abstract class Unit<TSelector extends UnitSelector = UnitSelector> {
  id: string = '';
  readonly selectorId: string;
  slotId: string;
  experience: Experience;
  optionIds: string[];
  men?: number;

  selector: TSelector;
  library: Library;

  updated$ = new Subject<void>();

  get title() {
    return this.selector
  }

  get availableExperienceLevels(): Experience[] {
    return this.selector?.availableExperienceLevels ?? [];
  }

  private _errors: string[] | null = null;
  get errors() { return this._errors; }

  protected _cost: number = 0;
  get cost() { return this._cost;}

  protected _specialRules: SpecialRule[] = [];
  get specialRules() { return this._specialRules; }

  constructor(data: IUnitModel, library: Library) {
    this.selectorId = data.selectorId;
    this.slotId = data.slotId;
    this.experience = data.experience;
    this.optionIds = data.optionIds ?? [];
    const selector = library.unitSelectors.find(p => p.id === data.selectorId);
    if (!selector) throw new Error("Unable to find selector");
    this.selector = selector as TSelector;
    this.library = library;
  }

  protected abstract validate(): string[] | null;
  protected abstract calculateCost(): number;
  protected calculateSpecialRules(): SpecialRule[] {
    const ids = this.selector?.specialRuleIds ?? [];
    const optionIds = this.selector?.options
      .filter(so => this.optionIds.some(o => o == so.id))
      .map(o => o.specialRuleId)
      .filter(s => !!s)
      .map(s => s as string) ?? [];

    return ids.concat(optionIds)
      .map(i => this.library.specialRules.find(r => r.id == i))
      .filter(r => !!r)
      .map(r => r);
  }

  public toStoredObject(): IUnitModel {
    this.refresh();
    return {
      selectorId: this.selectorId,
      slotId: this.slotId,
      experience: this.experience,
      optionIds: this.optionIds,
      cost: this.cost
    };
  }

  public refresh() {
    this._errors = this.validate();
    this._cost = this.calculateCost();
    this._specialRules = this.calculateSpecialRules();
    this.updated$.next();
  }
}

export class InfantryUnit extends Unit<InfantryUnitSelector> {
  override men: number;
  keyPersonWeaponId: string | null = null;
  get keyPersonWeapon() {
    return this.library.weapons.find(w => w.id == this.keyPersonWeaponId) ?? null;
  }
  generalWeaponIds: Record<string, number> = {};

  keyPersonWeaponOptions: (IInfantryWeaponOption|any)[];

  constructor(data: IInfantryUnitModel, library: Library) {
    super(data, library);
    this.men = data.men;
    if (data.keyPersonWeaponId) this.keyPersonWeaponId = data.keyPersonWeaponId;
    if (data.generalWeaponIds) this.generalWeaponIds = data.generalWeaponIds;
    this.keyPersonWeaponOptions = this.selector.keyPersonWeaponOptions.map(o => ({
      ...o,
      weapon: library.weapons.find(w => w.id ==  o.weaponId)
    }));
    this.refresh();
  }

  protected override validate(): string[] | null {
    const library = this.library;
    const errors: string[] = [];
    if (this.selector == null) throw Error('Selector missing, unable to validate.');
    // Validate Experience
    if (this.selector.cost != null && !this.availableExperienceLevels.some(a => a == this.experience))
      errors.push(`This unit cannot be ${this.experience}`);
    // Validate min/max
    if (this.men > this.selector.maxMen) errors.push(`You cannot have more than ${this.selector.maxMen} men in this unit.`)
    if (this.men < this.selector.baseMen) errors.push(`You cannot have less than ${this.selector.baseMen} men in this unit.`)
    // Validate Key Person Weapon Options
    if (!!this.keyPersonWeapon && !this.selector.keyPersonWeaponOptions.map(o => o.weaponId).some(i => i == this.keyPersonWeapon!.id))
      errors.push(`Invalid weapon choice for ${this.selector.keyPerson}`);
    // Validate Weapon Options
    const nonKeyPersonMen = this.men - 1;
    let menForWeaponAddons = 0;
    if (this.generalWeaponIds) {
    Object.keys(this.generalWeaponIds).forEach(k => {
        const qty = this.generalWeaponIds![k];
        const selector = this.selector?.generalWeaponOptions.find(o => o.weaponId);
        const weapon = library.weapons.find(w => w.id == k);
        if (!selector || !weapon) {
          errors.push(`Invalid weapons present`);
          return;
        }
        if (qty > selector.max) errors.push(`You have ${qty - selector.max} more ${weapon.name}s than this unit allows.`)
          menForWeaponAddons += weapon.crew ?? 1;
      })
      if (menForWeaponAddons > nonKeyPersonMen)
        errors.push(`Weapon addons required ${menForWeaponAddons} men but you only have ${nonKeyPersonMen} men available.`)
    }
    //Validate General Options
    this.optionIds?.forEach(o => {
      const selectorOption = this.selector?.options.find(s => s.id == o);
      if (!selectorOption) return;
      if (this.availableExperienceLevels.some(e => e == this.experience))
        errors.push(`${selectorOption.description} is not a valid option for a ${this.experience} unit.`);
      if (selectorOption.availableExperienceLevels && !selectorOption.availableExperienceLevels.includes(this.experience))
        errors.push(`${selectorOption.description} is not allowed to be taken for a ${this.experience} unit.`)
    })
    return errors.length ? errors : null;
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

  public override toStoredObject(): IInfantryUnitModel {
    return {
      ...super.toStoredObject(),
      men: this.men,
      keyPersonWeaponId: this.keyPersonWeaponId ?? null,
      generalWeaponIds: this.generalWeaponIds
    };
  }

}
