import { combineLatest, map, Observable } from "rxjs";
import { UnitType, UnitSubType } from "../units/unit-type.enum";
import { UnitRequirement } from "./unit-requirement.interface";
import { UnitSlotVisualiser } from "./unit-slot-visualiser.class";
import { Library } from "../units/library.interface";
import { Unit } from "../units/unit.class";


interface IUnit {
  type: UnitType;
  subType?: UnitSubType;
}

export class UnitSlotVisualizerOrchestrator {
  visualizers: UnitSlotVisualiser[] = [];
  allUnits$: Observable<Unit[]>;

  constructor(requirements: UnitRequirement[], units: Unit[], library: Library) {
    this.initializeVisualizers(requirements, units, library);
    this.allUnits$ = combineLatest(this.visualizers.map(v => v.selectedUnits$)).pipe(
      map((unitArrays) => unitArrays.flatMap(u => u))
    );
  }

  /**
   * Initializes the visualizers for each unit requirement and prepares the orchestrator.
   * @param requirements Array of unit requirements to build the visualizers from.
   */
  private initializeVisualizers(requirements: UnitRequirement[], units: Unit[], library: Library): void {
    requirements.forEach((requirement) => {
      const visualizer = new UnitSlotVisualiser(requirement, units.filter(u => u.slotId === requirement.id), library);
      this.visualizers.push(visualizer);
    });
  }

}
