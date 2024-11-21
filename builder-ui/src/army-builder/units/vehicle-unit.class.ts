import { Library } from "./library.interface";
import { VehicleUnitSelector } from "./vehicle-unit-selector.class";
import { Unit, IUnitModel, IUnitWeaponDetail } from "./unit.class";
import { ITeamUnitModel } from "./team-unit.class";

export interface IVehicleUnitModel extends IUnitModel {
}

export class VehicleUnit extends Unit<VehicleUnitSelector> {

  constructor(data: ITeamUnitModel, library: Library) {
    super(data, library);
    this.refresh();
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
    return [];
  }

  public override toStoredObject(): IVehicleUnitModel {
    return {
      ...super.toStoredObject()
    };
  }

}
