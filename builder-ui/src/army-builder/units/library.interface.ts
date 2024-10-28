import { PlatoonSelector } from "../platoons/platoon-selector.class";
import { SpecialRule } from "../special-rules/special-rule.interface";
import { Weapon } from "../weapons/weapon.interface";
import { UnitSelector } from "./unit-selector.class";


export interface Library {
  platoonSelectors: PlatoonSelector[];
  unitSelectors: UnitSelector[];
  weapons: Weapon[];
  specialRules: SpecialRule[];
}
