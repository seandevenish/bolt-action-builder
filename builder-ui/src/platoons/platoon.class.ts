import { generateGuid } from "../app/utilities/guid";
import { PlatoonSelector } from "./platoon-selector.class";

export class Platoon {
  id: string;
  selectorId: string;
  selector?: PlatoonSelector;
  platoonName?: string;
  units: string[]; //Todo: this is a placeholder and will become more compelx in time

  get name() {
  return this.selector?.name;
  }

  constructor(data: Partial<Platoon>, selector?: PlatoonSelector) {
    this.id = data.id ? data.id : generateGuid();
    this.platoonName = data.platoonName;
    this.units = data.units || [];

    if (selector) {
      // If a selector is provided during creation, set it and store its ID
      this.selector = selector;
      this.selectorId = selector.id;
    } else if (data.selectorId) {
      // If loading from the database, only store the selectorId (selector will be loaded later)
      this.selectorId = data.selectorId;
    } else {
      throw new Error("A selector or selectorId must be provided when creating a Platoon.");
    }
  }

  assignSelector(platoonSelectors: PlatoonSelector[]): void {
    this.selector = platoonSelectors.find(p => p.id == this.selectorId);
  }

  toStoredObject(): Record<string, any> {
    return {
      id: this.id,
      selectorId: this.selectorId,
      platoonName: this.platoonName ?? null
    };
  }
}
