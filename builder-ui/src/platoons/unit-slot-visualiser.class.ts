import { UnitRequirement } from "./unit-requirement.interface";
import { UnitSlot } from "./unit-slot.interface";

export class UnitSlotVisualiser {
  slots: UnitSlot[] = [];
  private currentRequirement: UnitRequirement;

  get groupable() {
    return this.currentRequirement?.max === 1;
  }

  constructor(requirement: UnitRequirement) {
    this.currentRequirement = requirement;
    this.updateFilledSlots(0);
  }

  /**
   * Updates the unfilled slots based on the current number of filled slots.
   * @param filledSlotCount The current count of filled slots.
   */
  updateFilledSlots(filledSlotCount: number): void {
    this.slots = []; // Clear any existing slots

    const minLimit = this.calculateMinLimit();
    const maxLimit = this.calculateMaxLimit();

    // Add mandatory unfilled slots if required
    for (let i = filledSlotCount; i < minLimit; i++) {
      this.slots.push({
        type: this.currentRequirement.types[0],
        subType: this.currentRequirement.subTypes ? this.currentRequirement.subTypes[0] : undefined,
        isMandatory: true,
        isInvalid: false
      });
    }

    // Add only one optional unfilled slot if there are available slots beyond the mandatory ones
    if (filledSlotCount >= minLimit && filledSlotCount < maxLimit) {
      this.slots.push({
        type: this.currentRequirement.types[0],
        subType: this.currentRequirement.subTypes ? this.currentRequirement.subTypes[0] : undefined,
        isMandatory: false,
        isInvalid: false
      });
    }
  }

  /**
   * Dynamically calculates the minimum number of units required based on min and minPerUnit constraints.
   * @returns The calculated minimum limit of units.
   */
  private calculateMinLimit(): number {
    if (this.currentRequirement.min !== undefined && this.currentRequirement.min !== null) {
      return this.currentRequirement.min;
    }
    if (this.currentRequirement.minPerUnit !== undefined && this.currentRequirement.minPerUnit !== null) {
      return this.currentRequirement.minPerUnit;
    }
    return 0; // If no min or minPerUnit is specified, fallback to 0 as the default minimum
  }

  /**
   * Dynamically calculates the maximum number of units allowed based on max and maxPerUnit constraints.
   * @returns The calculated maximum limit of units.
   */
  private calculateMaxLimit(): number {
    if (this.currentRequirement.max !== undefined && this.currentRequirement.max !== null) {
      return this.currentRequirement.max;
    }
    if (this.currentRequirement.maxPerUnit !== undefined && this.currentRequirement.maxPerUnit !== null) {
      return this.calculateMinLimit() + this.currentRequirement.maxPerUnit;
    }
    return this.calculateMinLimit(); // If no max or maxPerUnit is specified, fallback to the min limit as the maximum
  }
}
