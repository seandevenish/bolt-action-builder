import { Subject } from "rxjs";
import { IFirestoreStorable } from "../../app/services/firestore-base-service.service";
import { SpecialRule } from "../special-rules/special-rule.interface";
import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { UnitSelector } from "./unit-selector.class";
import { Weapon } from "../weapons/weapon.interface";

export interface IUnitModel extends IFirestoreStorable {
  selectorId: string;
  slotId: string;
  cost: number;
  experience: Experience;
  optionIds: string[];
}

export interface IUnitWeaponDetail {
  qty: number;
  role?: string | null;
  description: string;
  weapon: Weapon;
  special: string;
}

export abstract class Unit<TSelector extends UnitSelector = UnitSelector> {
  id: string = '';
  readonly selectorId: string;
  slotId: string;
  experience: Experience;
  optionIds: string[];

  selector: TSelector;
  library: Library;
  men?: number;

  updated$ = new Subject<void>();

  get title() {
    return this.selector
  }

  get countString(): string { return 'Unit'; }

  get availableExperienceLevels(): Experience[] {
    return this.selector?.availableExperienceLevels ?? [];
  }

  private _errors: string[] | null = null;
  get errors() { return this._errors != null && this._errors.length > 0 ? this._errors : null; }

  protected _cost: number = 0;
  get cost() { return this._cost;}

  protected _specialRules: SpecialRule[] = [];
  get specialRules() { return this._specialRules; }

  protected _weaponSummary: IUnitWeaponDetail[] = [];
  get weaponSummary() { return this._weaponSummary; }

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

  protected abstract calculateCost(): number;
  protected abstract calculateWeaponSummary(): IUnitWeaponDetail[];

  protected validate(): string[] | null {
    const errors: string[] = [];
    //Validate General Options
    this.optionIds?.forEach(o => {
      const selectorOption = this.selector?.options.find(s => s.id == o);
      if (!selectorOption) return;
      if (selectorOption.availableExperienceLevels && !selectorOption.availableExperienceLevels.includes(this.experience))
        errors.push(`A <strong>${this.experience}</strong> unit is not allowed "${selectorOption.description}".`)
    })
    return errors.length ? errors : null;
  }

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
    this._weaponSummary = this.calculateWeaponSummary();
    this.updated$.next();
  }
}

