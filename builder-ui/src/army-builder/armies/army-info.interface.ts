import { PlatoonSelector } from "../platoons/platoon-selector.class";
import { Platoon } from "../platoons/platoon.class";
import { UnitSelector } from "../units/unit-selector.class";
import { Army } from "./army.class";

export interface IArmyInfo {
  army: Army;
  platoons: Platoon[];
  platoonSelectors: PlatoonSelector[];
  unitSelectors: UnitSelector[];
}
