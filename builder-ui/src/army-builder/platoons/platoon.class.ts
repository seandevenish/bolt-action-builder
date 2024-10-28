import { Unit } from './../units/unit.class';
import { UnitFactory } from "../units/unit-factory";
import { Library } from "../units/library.interface";
import { generateGuid } from "../../app/utilities/guid";
import { UnitSelector } from "../units/unit-selector.class";
import { IUnitModel } from "../units/unit.class";
import { PlatoonSelector } from "./platoon-selector.class";
import { BehaviorSubject, map, Observable } from 'rxjs';
import { IFirestoreStorable } from '../../app/services/firestore-base-service.service';

export interface IPlatoonModel extends IFirestoreStorable {
  id: string;
  selectorId: string;
  platoonName: string | null;
  units?: IUnitModel[];
}

export class Platoon {
  id: string;
  selector: PlatoonSelector;
  platoonName: string | null;

  readonly units$: BehaviorSubject<Unit[]>;
  readonly cost$: Observable<number>;

  get name() {
    return this.selector?.name;
  }

  constructor(data: Partial<IPlatoonModel>, library: Library) {
    this.id = data.id ?? generateGuid();
    this.platoonName = data.platoonName ?? null;
    const selector = library.platoonSelectors.find(p => p.id === data.selectorId);
    if (!selector) throw new Error("Unable to find selector");
    this.selector = selector;

    const units = this.buildUnits(data.units ?? [], library);
    this.units$ = new BehaviorSubject(units);
    this.cost$ = this.units$.pipe(
      map(unitsArray => unitsArray.reduce((total, unit) => total + unit.cost, 0))
    );
  }

  private buildUnits(unitModels: IUnitModel[], library: Library): Unit[] {
    return unitModels.map(u => {
      const selector = library.unitSelectors.find(s => s.id == u.selectorId);
      if (!selector) throw Error("Unable to find selector " + u.selectorId);
      return UnitFactory.loadUnit(u, selector, library);
    })
  }

  updateUnits(units: Unit[]) {
    this.units$.next(units);
  }

  toStoredObject(): IPlatoonModel {
    return {
      id: this.id,
      selectorId: this.selector.id,
      platoonName: this.platoonName ?? null,
      units: this.units$.getValue().map(u => u.toStoredObject()) as IUnitModel[] // todo: 'UnitModel'
    };
  }
}
