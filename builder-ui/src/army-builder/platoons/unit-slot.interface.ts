import { UnitSubType, UnitType } from "../units/unit-type.enum";

export interface UnitSlot {
  type: UnitType;
  subType?: UnitSubType;
  isMandatory: boolean;
  isLastAvailable?: boolean;
  isInvalid?: boolean;
}
