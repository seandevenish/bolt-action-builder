import { IGeneralOptionSelector } from "../units/unit-selector.class";
import { UnitType, UnitSubType } from "../units/unit-type.enum";


export interface UnitRequirement {

  id: string;

    /**
   * Enables the requirement slots to have a sub-header with a customised name rather than just a list of the available unit types
   * E.g. 'Platoon Commander'
   */
  requirementName?: string;

  /**
   * An array of specific unit IDs that are allowed for this requirement.
   * Use this to explicitly specify which units can be selected, rather than relying on type/subtype filtering.
   * If empty, all units matching the type/subtype criteria are allowed.
   */
  unitSelectorIds: string[];

  /**
   * An array of primary unit types that are required or allowed.
   * E.g., [UnitType.PlatoonCommander, UnitType.CompanyCommander]
   */
  types: UnitType[];

  /**
   * An optional array of specific sub-types that are included.
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
  min?: number | null;

  /**
   * The maximum number of units allowed for this requirement.
   * Defines the upper limit of units of the specified type or sub-type. If omitted, there is no maximum.
   */
  max?: number | null;

  /**
   * The maximum number of units allowed for this requirement as a multiple per units not subject to this limit
   */
  maxPerUnit?: number | null;

  minCarryAll?: boolean;

  /**
   * Options available to this unit
   */
  options?: IGeneralOptionSelector[];
}
