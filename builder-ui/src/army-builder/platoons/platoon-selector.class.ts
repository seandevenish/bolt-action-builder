import { PlatoonCategory } from './platoon-category.enum';
import { UnitRequirement } from './unit-requirement.interface';

export class PlatoonSelector {
  readonly id: string;
  readonly name: string;
  readonly platoonCategory: PlatoonCategory;
  readonly unitRequirements: UnitRequirement[];

  constructor(id: string, name: string, platoonCategory: PlatoonCategory, unitRequirements: UnitRequirement[]) {
    this.id = id;
    this.name = name;
    this.platoonCategory = platoonCategory;
    this.unitRequirements = unitRequirements;
  }
}
