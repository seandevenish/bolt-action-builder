import { IFirestoreStorable } from "../../app/services/firestore-base-service.service";
import { generateGuid } from "../../app/utilities/guid";
import { Faction } from "../faction";

export class Army implements IFirestoreStorable {
  id: string;
  name: string;
  description?: string;
  factionId: string;
  faction?: Faction;
  createdDate?: Date;
  modifiedDate?: Date;
  points: number = 1000;

  constructor(data: { name: string; factionId: string } & Partial<Army>, factionLibrary?: Faction[]) {
    const newId = !data.id;
    this.id = data.id ? data.id : generateGuid();
    this.name = data.name;
    this.factionId = data.factionId;
    this.createdDate = data.createdDate;
    this.modifiedDate = data.modifiedDate;
    this.update(data);
    if (factionLibrary) this.loadProperties(factionLibrary);
  }

  update(data: Partial<Army>) {
    if (data.name) this.name = data.name;
    this.description = data.description;
    if (data.factionId) this.factionId = data.factionId;
    if (data.faction) this.factionId = data.faction.id;
  }

  loadProperties(factionLibrary: Faction[]): void {
    this.faction = factionLibrary.find((f) => f.id === this.factionId);
  }

  toStoredObject(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      factionId: this.factionId,
      createdDate: this.createdDate ?? new Date(),
      modifiedDate: new Date(),
      points: this.points
    };
  }
}

