import { Library } from "./library.interface";
import { IVehicleWeaponOption, VehicleUnitSelector } from "./vehicle-unit-selector.class";
import { Unit, IUnitModel, IUnitWeaponDetail } from "./unit.class";
import { ITeamUnitModel } from "./team-unit.class";

export interface IVehicleUnitModel extends IUnitModel {
  weaponOptionIds?: string[];
}

export class VehicleUnit extends Unit<VehicleUnitSelector> {

  weaponOptionIds: string[];
  weaponOptions: (IVehicleWeaponOption)[];

  get damageValue() {
    return this.selector.damageValue;
  }

  get transportCapacity() {
    return this.selector.transportCapacity;
  }

  constructor(data: IVehicleUnitModel, library: Library) {
    super(data, library);
    this.refresh();
    this.weaponOptionIds = data?.weaponOptionIds ?? [];
    this.weaponOptions = this.selector.weaponOptions.map(o => ({
      ...o,
      weapons: o.weapons.map(w => ({
        ...w,
        weapon: library.weapons.find(lw => lw.id == w.weaponId)
      })) 
    }));

  }

  public override get countString(): string {
    return 'Vehicle';
  }

  protected override validate(): string[] | null {
    const errors = super.validate() ?? [];
    if (this.selector == null) throw Error('Selector missing, unable to validate.');
    // Validate Experience
    if (this.selector.cost != null && !this.availableExperienceLevels.some(a => a == this.experience))
      errors.push(`This unit cannot be ${this.experience}`);
    return errors.length ? errors : null;
  }

  protected override calculateCost() {
    if (this.selector == null) throw Error('Selector missing, unable to calculate cost.');
    const base = this.selector.cost[this.experience];
    const options = this.selector.options.reduce((v, o) => {
      const selected = this.optionIds.some(s => s == o.id);
      if (!selected) return v;
      return v + (o.cost ?? 0);
    }, 0);
    return base + options;
  }

  protected override calculateWeaponSummary(): IUnitWeaponDetail[] {
    const excludeSpecialRules = ['Team','Fixed'];

    const weapons = this.selector.baseWeapons.map(w => ({
      qty: w.qty ?? 1,
      description: w.description,
      weapon: w.weapon,
      special: w.weapon?.specialRules?.filter(r => !excludeSpecialRules.includes(r.id)).map(r => r.name).join(", ") ?? ""
    }) as IUnitWeaponDetail);

    // Todo: modify for weapon options
    const options = this.selector.weaponOptions;

    return [
      ...weapons
    ].filter(r => r.qty > 0);

    return [];
  }

  public override toStoredObject(): IVehicleUnitModel {
    return {
      ...super.toStoredObject(),
      weaponOptionIds: this.weaponOptionIds
    };
  }

}
