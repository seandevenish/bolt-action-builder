import { SpecialRule } from "../special-rules/special-rule.interface";
import { WeaponType } from "./weapon-type.enum";

export interface Weapon {
  id: string;
  name: string;
  crew?: number;
  type: WeaponType;
  penetrationValue: number;
  hits: number;
  range: number;
  minIndirectRange: number;
  maxIndirectRange: number;
  shots: number;
  specialRuleIds: string[];
  specialRules?: SpecialRule[];
  heDiameter: number;
}
