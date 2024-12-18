import { UnitRequirement } from "../platoons/unit-requirement.interface";
import { Library } from "./library.interface";
import { TeamUnitSelector } from "./team-unit-selector.class copy";
import { Unit, IUnitModel, IUnitWeaponDetail } from "./unit.class";

export interface ITeamUnitModel extends IUnitModel {
}

export class TeamUnit extends Unit<TeamUnitSelector> {

  constructor(data: ITeamUnitModel, slot: UnitRequirement, library: Library) {
    super(data, slot, library);
    this.men = this.selector.baseMen;
    this.refresh();
  }

  public override get countString(): string {
    return this.selector.baseMen + ' crew';
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
    const options = this.availableOptions.reduce((v, o) => {
      const selected = this.optionIds.some(s => s == o.id);
      if (!selected) return v;
      return v + (o.cost ?? 0);
    }, 0);
    return base + options;
  }

  protected override calculateWeaponSummary(): IUnitWeaponDetail[] {
    return [{
      qty: this.selector.baseWeaponQty,
      role: null,
      description: this.selector.baseWeaponDescription ?? this.selector.baseWeapon!.name,
      weapon: this.selector.baseWeapon!,
      special: this.selector.baseWeapon?.specialRules?.map(r => r.name).join(", ") ?? ""
    }];
  }

  public override toStoredObject(): ITeamUnitModel {
    return {
      ...super.toStoredObject()
    };
  }

}
