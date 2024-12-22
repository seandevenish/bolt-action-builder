import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { UnitSelector } from "./unit-selector.class";
import { InfantryUnitSelector } from './infantry-unit-selector.class';
import { Unit, IUnitModel } from "./unit.class";
import { IInfantryUnitModel, InfantryUnit } from "./infantry-unit.class";
import { VehicleUnitSelector } from "./vehicle-unit-selector.class";
import { ITeamUnitModel, TeamUnit } from "./team-unit.class";
import { IVehicleUnitModel, VehicleUnit } from "./vehicle-unit.class";
import { TeamUnitSelector } from "./team-unit-selector.class";
import { UnitRequirement } from "../platoons/unit-requirement.interface";


export class UnitFactory {

  static generateNewUnit(selector: UnitSelector, slot: UnitRequirement, library: Library): Unit {
    var unit = this.getUnit(selector, library, slot);
    return unit;
  }

  static loadUnit(unit: IUnitModel, selector: UnitSelector, slot: UnitRequirement, library: Library) {
    const loadedUnit = this.getUnit(selector, library, slot, unit);
    return loadedUnit;
  }

  private static getUnit(selector: UnitSelector, library: Library, slot: UnitRequirement, unit?: IUnitModel): Unit {
    const base = {
      selectorId: selector.id,
      experience: selector.availableExperienceLevels.includes(Experience.Regular) ?
        Experience.Regular :
        selector.availableExperienceLevels[selector.availableExperienceLevels.length - 1],
    };

    if (selector instanceof InfantryUnitSelector) {
      return new InfantryUnit({
        ...base,
        ...unit as IInfantryUnitModel,
        men: (unit as IInfantryUnitModel)?.men ?? selector.baseMen
      }, slot, library);
    }

    if (selector instanceof TeamUnitSelector) {
      return new TeamUnit({
        ...base,
        ...unit as ITeamUnitModel
      }, slot, library);
    }

    if (selector instanceof VehicleUnitSelector) {
      return new VehicleUnit({
        ...base,
        ...unit as IVehicleUnitModel
      }, slot, library);
    }

    throw Error('Unknown selector type');
  }
}
