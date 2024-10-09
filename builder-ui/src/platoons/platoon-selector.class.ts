import { PlatoonCategory } from './platoon-category.enum';
import { UnitRequirement } from './unit-requirement.interface';

export class PlatoonSelector {
  id: string;
  name: string;
  platoonCategory: PlatoonCategory;
  unitRequirements: UnitRequirement[];

  constructor(id: string, name: string, platoonCategory: PlatoonCategory, unitRequirements: UnitRequirement[]) {
    this.id = id;
    this.name = name;
    this.platoonCategory = platoonCategory;
    this.unitRequirements = unitRequirements;
  }

  /**
   * Validates the selected units against the unit requirements of this platoon selector.
   * Ensures that both primary unit types and their sub-types meet the specified min/max constraints.
   * @param selectedUnits The units to be validated.
   * @returns True if the selected units satisfy all the requirements, false otherwise.
   */
  // validateUnits(selectedUnits: Unit[]): boolean {
  //   for (const requirement of this.unitRequirements) {
  //     // Count units that match the requirement's type and sub-type criteria
  //     const count = selectedUnits.filter(unit => {
  //       const isTypeMatch = requirement.types.includes(unit.type);
  //       const isSubTypeMatch = !requirement.subTypes || (unit.subType && requirement.subTypes.includes(unit.subType));
  //       const isExcluded = requirement.excludeSubTypes && unit.subType && requirement.excludeSubTypes.includes(unit.subType);
  //       return isTypeMatch && isSubTypeMatch && !isExcluded;
  //     }).length;

  //     // Check if the count of matching units satisfies the min/max requirements
  //     if (count < requirement.min) {
  //       return false; // Fails if the required number of units is not met
  //     }
  //     if (requirement.max !== undefined && count > requirement.max) {
  //       return false; // Fails if the maximum limit of units is exceeded
  //     }
  //   }

  //   // All requirements are satisfied
  //   return true;
  // }
}


