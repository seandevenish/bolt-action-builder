import { IFirestoreStorable } from "../../app/services/firestore-base-service.service";
import { SpecialRule } from "../special-rules/special-rule.interface";
import { Weapon } from "../weapons/weapon.interface";
import { Experience } from "./experience";
import { InfantryUnitSelector, UnitSelector } from "./unit-selector.class";

export interface IUnit {
  selector?: UnitSelector;
}

export class UnitFactory {

  static generateNewUnit(selector: UnitSelector) {
    const base = {
      selectorId: selector.id,
      experience: selector.availableExperienceLevels.includes(Experience.Regular) ? 
        Experience.Regular : 
        selector.availableExperienceLevels[selector.availableExperienceLevels.length - 1],
    }

    if (selector instanceof InfantryUnitSelector) {
      return new InfantryUnit({
        ...base,
        men: selector.baseMen
      });
    }

    //todo: add other types
  }
}

export abstract class Unit<TSelector extends UnitSelector = UnitSelector> implements IUnit, IFirestoreStorable {
  id: string = '';
  selectorId: string;
  experience: Experience;
  options: string[];
  selector?: TSelector;

  get availableExperienceLevels(): Experience[] {
    return this.selector?.availableExperienceLevels ?? [];
  }

  private _errors: string[] | null = null;
  get errors() { return this._errors; }

  protected _cost: number = 0;
  get cost() { return this._cost;}

  protected _specialRules: SpecialRule[] = [];
  get specialRules() { return this._specialRules;}


  constructor(data: {
    selectorId: string,
    experience: Experience,
    options?: string[]
  }) {
    this.selectorId = data.selectorId;
    this.experience = data.experience;
    this.options = data.options ?? [];
  }

  abstract init(selector: TSelector): void;

  protected abstract validate(weapons: Weapon[]): string[] | null;
  protected abstract calculateCost(): void;
  protected calculateSpecialRules(specialRules: SpecialRule[]) {
    const ids = this.selector?.specialRuleIds ?? [];
    const optionIds = this.selector?.options
      .filter(so => this.options.some(o => o == so.id))
      .map(o => o.specialRuleId)
      .filter(s => !!s)
      .map(s => s as string) ?? [];

    this._specialRules = ids.concat(optionIds)
      .map(i => specialRules.find(r => r.id == i))
      .filter(r => !!r)
      .map(r => r as SpecialRule);
  }

  public toStoredObject(): Record<string, any> {
    return {
      id: this.id,
      selectorId: this.selectorId,
      experience: this.experience,
      options: this.options
    };
  }
  

  public update(weapons: Weapon[], specialRules: SpecialRule[]) {
    this._errors = this.validate(weapons);
    this.calculateCost();
    this.calculateSpecialRules(specialRules);
  }
}

export class InfantryUnit extends Unit<InfantryUnitSelector> {
  men: number;
  keyPersonWeaponId?: string
  generalWeaponIds?: Record<string, number>; // todo: will this serialise from json ok?

  constructor(data: {
    selectorId: string,
    experience: Experience,
    options?: string[],
    men: number,
    keyPersonWeaponId?: string,
    generalWeaponIds?: Record<string, number>
  }) {
    super(data);
    this.men = data.men;
    this.keyPersonWeaponId = data.keyPersonWeaponId;
    this.generalWeaponIds = data.generalWeaponIds;
  }

  override init(selector: InfantryUnitSelector) {
    if (this.selectorId != selector.id) throw Error('Invalid selector!');
    this.selector = selector;
  }

  protected override validate(weapons: Weapon[]): string[] | null {
    const errors: string[] = [];
    if (this.selector == null) throw Error('Selector missing, unable to validate.');
    // Validate Experience
    if (this.selector.cost != null && !this.availableExperienceLevels.some(a => a == this.experience))
      errors.push(`This unit cannot be ${this.experience}`);
    // Validate min/max
    if (this.men > this.selector.maxMen) errors.push(`You cannot have more than ${this.selector.maxMen} men in this unit.`)
    if (this.men < this.selector.baseMen) errors.push(`You cannot have less than ${this.selector.baseMen} men in this unit.`)
    // Validate Key Person Weapon Options
    if (!!this.keyPersonWeaponId && !this.selector.keyPersonWeaponOptions.map(o => o.weaponId).some(i => i == this.keyPersonWeaponId))
      errors.push(`Invalid weapon choice for ${this.selector.keyPerson}`);
    // Validate Weapon Options
    const nonKeyPersonMen = this.men - 1;
    let menForWeaponAddons = 0;
    if (this.generalWeaponIds) {
    Object.keys(this.generalWeaponIds).forEach(k => {
        const qty = this.generalWeaponIds![k];
        const selector = this.selector?.generalWeaponOptions.find(o => o.weaponId);
        const weapon = weapons.find(w => w.id == k);
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
    this.options.forEach(o => {
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
      const selected = this.options.some(s => s == o.id);
      if (!selected) return v;
      return v + (o.costPerMan ?? 0) * this.men + (o.cost ?? 0);
    }, 0);
    const weaponOptions = this.selector.generalWeaponOptions.reduce((v, o) => { 
      const qty = this.generalWeaponIds[o.weaponId] ?? 0;
      return v + (qty * o.cost);
    }, 0);
    this._cost = base + perMan + options + weaponOptions;
  }

  public override toStoredObject(): Record<string, any> {
    return {
      ...super.toStoredObject(),
      men: this.men,
      keyPersonWeaponId: this.keyPersonWeaponId,
      generalWeaponIds: this.generalWeaponIds,
      selectorId: this.selectorId
    };
  }
  
}
