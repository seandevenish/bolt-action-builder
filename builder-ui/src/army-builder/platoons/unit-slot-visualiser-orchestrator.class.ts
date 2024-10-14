import { UnitSelector } from "../units/unit-selector.class";
import { UnitType, UnitSubType } from "../units/unit-type.enum";
import { UnitRequirement } from "./unit-requirement.interface";
import { UnitSlotVisualiser } from "./unit-slot-visualiser.class";


interface IUnit {
  type: UnitType;
  subType?: UnitSubType;
}

export class UnitSlotVisualizerOrchestrator {
  visualizers: UnitSlotVisualiser[] = [];
  allSlots: IUnit[] = [];
  allUnfilledSlots: UnitSlotVisualiser[] = [];

  constructor(requirements: UnitRequirement[], unitSelectors: UnitSelector[]) {
    this.initializeVisualizers(requirements, unitSelectors);
  }

  /**
   * Initializes the visualizers for each unit requirement and prepares the orchestrator.
   * @param requirements Array of unit requirements to build the visualizers from.
   */
  private initializeVisualizers(requirements: UnitRequirement[], unitSelectors: UnitSelector[]): void {
    requirements.forEach((requirement) => {
      const visualizer = new UnitSlotVisualiser(requirement, unitSelectors);
      this.visualizers.push(visualizer);
    });
  }

  /**
   * Updates the unfilled slots across all visualizers based on the current state of the filled units.
   * @param filledUnits Map of unit counts for each visualizer based on current unit data.
   */
  updateUnfilledSlots(filledUnits: Map<UnitRequirement, IUnit[]>): void {
    this.allSlots = []; // Reset to clear the previous state
    this.allUnfilledSlots = []; // Reset to clear the previous unfilled slots

    this.visualizers.forEach((visualizer) => {
      const requirement = visualizer['currentRequirement'];
      const currentFilledUnits = filledUnits.get(requirement) || [];

      // Update visualizer with the count of filled units
      visualizer.updateFilledSlots(currentFilledUnits.length);

      // Aggregate all slots and unfilled slots for centralized visualization
      this.allSlots.push(...currentFilledUnits);
      this.allUnfilledSlots.push(visualizer);
    });
  }
}
