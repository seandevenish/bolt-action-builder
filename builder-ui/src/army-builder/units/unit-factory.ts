import { Experience } from "./experience.enum";
import { Library } from "./library.interface";
import { UnitSelector, InfantryUnitSelector } from "./unit-selector.class";
import { Unit, IUnitModel, InfantryUnit, IInfantryUnitModel } from "./unit.class";


export class UnitFactory {

  static generateNewUnit(selector: UnitSelector, library: Library): Unit {
    var unit = this.getUnit(selector, library);
    return unit;
  }

  static loadUnit(unit: IUnitModel, selector: UnitSelector, library: Library) {
    const loadedUnit = this.getUnit(selector, library, unit);
    return loadedUnit;
  }

  private static getUnit(selector: UnitSelector, library: Library, unit?: IUnitModel): Unit {
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
      }, library);
    }

    throw Error('Unknown selector type');
  }
}
