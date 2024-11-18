import { Library } from "./library.interface";
import { TeamUnitSelector } from "./team-unit-selector.class";
import { Unit, IUnitModel } from "./unit.class";

export interface ITeamUnitModel extends IUnitModel {
}

export class TeamUnit extends Unit<TeamUnitSelector> {

  constructor(data: ITeamUnitModel, library: Library) {
    super(data, library);
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
    const options = this.selector.options.reduce((v, o) => {
      const selected = this.optionIds.some(s => s == o.id);
      if (!selected) return v;
      return v + (o.cost ?? 0);
    }, 0);
    return base + options;
  }

  public override toStoredObject(): ITeamUnitModel {
    return {
      ...super.toStoredObject()
    };
  }

}
