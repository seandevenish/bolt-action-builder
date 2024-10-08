import { UnitType, UnitSubType } from "../units/unit-type.enum";


export interface UnitRequirement {
  /**
   * An array of primary unit types that are required or allowed.
   * E.g., [UnitType.PlatoonCommander, UnitType.CompanyCommander]
   */
  types: UnitType[];

  /**
   * An optional array of specific sub-types that are required or allowed.
   * Use this to specify more granular unit requirements, such as [UnitSubType.LightMortar, UnitSubType.MediumMortar].
   */
  subTypes?: UnitSubType[];

  /**
   * An optional array of sub-types to exclude from the unit selection.
   * Use this to explicitly restrict certain sub-types within the given unit types, such as [UnitSubType.HeavyMortar].
   */
  excludeSubTypes?: UnitSubType[];

  /**
   * The minimum number of units required for this requirement.
   * Ensures that at least this many units of the specified type or sub-type are present.
   */
  min: number;

  /**
   * The maximum number of units allowed for this requirement.
   * Defines the upper limit of units of the specified type or sub-type. If omitted, there is no maximum.
   */
  max?: number;

    /**
   * The minimum number of units allowed for this requirement as a multiple per units not subject to this limit
   */
  minPerUnit?: number;

  /**
   * The maximum number of units allowed for this requirement as a multiple per units not subject to this limit
   */
  maxPerUnit?: number;
}
