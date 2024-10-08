import { generateGuid } from "../app/utilities/guid";

export class Platoon {
  id: string;
  platoonName: string;
  units: string[];
  commander: string;

  constructor(data: Partial<Platoon>) {
    this.id = data.id ? data.id : generateGuid();
    this.platoonName = data.platoonName || 'Unnamed Platoon';
    this.units = data.units || [];
    this.commander = data.commander || 'Unknown Commander';
  }

  toStoredObject(): Record<string, any> {
    return {
      id: this.id,
      platoonName: this.platoonName,
      units: this.units,
      commander: this.commander,
    };
  }
}
