import { WeaponType } from "./weapon-type.enum";

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  penetrationValue: number;
  hits: number;
  range: number;
  minIndirectRange: number;
  maxIndirectRange: number;
  shots: number;
  specialRuleIds: string[];
  heDiameter: number;
}
