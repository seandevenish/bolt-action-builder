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
  allUnits: IUnit[] = [];

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

}
