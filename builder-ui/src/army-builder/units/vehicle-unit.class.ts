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
    const weaponOptionsCost = this.selector.weaponOptions?.reduce((v, o) => {
      const selected = this.weaponOptionIds?.some(s => s == o.id);
      if (!selected) return v;
      return v + (o.cost ?? 0);
    }, 0);
    return base + options + weaponOptionsCost;
  }

  protected override calculateWeaponSummary(): IUnitWeaponDetail[] {
    const excludeSpecialRules = ['Team','Fixed'];

    // Get base weapons first
    let weapons = this.selector.baseWeapons.map(w => ({
        qty: w.qty ?? 1,
        description: w.description,
        weapon: w.weapon,
        special: w.weapon?.specialRules?.filter(r => !excludeSpecialRules.includes(r.id)).map(r => r.name).join(", ") ?? ""
    }) as IUnitWeaponDetail);

    // Apply weapon options
    this.weaponOptionIds?.forEach(optionId => {
        const option = this.weaponOptions.find(o => o.id === optionId);
        if (!option) return;

        // Remove weapons that are being replaced
        weapons = weapons.filter(w => 
            !option.replaceIds.some(replaceId => 
                this.selector.baseWeapons.find(bw => bw.id === replaceId)?.description === w.description
            )
        );

        // Add new weapons from the option
        const newWeapons = option.weapons.map(w => ({
            qty: w.qty ?? 1,
            description: w.description,
            weapon: w.weapon,
            special: w.weapon?.specialRules?.filter(r => !excludeSpecialRules.includes(r.id)).map(r => r.name).join(", ") ?? ""
        }) as IUnitWeaponDetail);

        weapons = [...weapons, ...newWeapons];
    });

    return weapons.filter(r => r.qty > 0);
  }

  public override toStoredObject(): IVehicleUnitModel {
    return {
      ...super.toStoredObject(),
      weaponOptionIds: this.weaponOptionIds
    };
  }

}
