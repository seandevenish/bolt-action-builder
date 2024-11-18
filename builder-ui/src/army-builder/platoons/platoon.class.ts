import { Unit } from './../units/unit.class';
import { UnitFactory } from "../units/unit-factory";
import { Library } from "../units/library.interface";
import { generateGuid } from "../../app/utilities/guid";
import { IUnitModel } from "../units/unit.class";
import { PlatoonSelector } from "./platoon-selector.class";
import { BehaviorSubject, combineLatest, map, mapTo, merge, Observable, startWith, switchMap } from 'rxjs';
import { IFirestoreStorable } from '../../app/services/firestore-base-service.service';

export interface IPlatoonModel extends IFirestoreStorable {
  id: string;
  selectorId: string;
  platoonName: string | null;
  units?: IUnitModel[];
  order: number;
}

export class Platoon {
  id: string;
  selector: PlatoonSelector;
  platoonName: string | null;

  readonly units$: BehaviorSubject<Unit[]>;
  readonly errors$: Observable<string[] | null>;
  readonly cost$: Observable<number>;
  readonly updated$: Observable<void>;

  readonly platoonHasErrors$: Observable<boolean>;
  readonly unitsHaveErrors$: Observable<boolean>;
  readonly hasErrors$: Observable<boolean>;


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
    this.errors$ = this.units$.pipe(
      map(u => this.validate(u))
    );
    this.updated$ = this.units$.pipe(
      switchMap(unitsArray =>
        merge(
          ...unitsArray.map(unit => unit.updated$),
          this.units$.pipe(map(() => undefined))
        )
      )
    );
    this.cost$ = this.units$.pipe(
      switchMap(unitsArray =>
        merge(
          ...unitsArray.map(unit => unit.updated$),
          this.units$
        ).pipe(
          map(() => unitsArray.reduce((total, unit) => total + unit.cost, 0))
        )
      )
    );

    this.platoonHasErrors$ = this.errors$.pipe(
      map(errors => errors != null && errors.length > 0)
    );
    this.unitsHaveErrors$ = this.units$.pipe(
      switchMap(units => {
        // Create an array of observables that emit whether each unit has errors
        const unitErrorObservables = units.map(unit =>
          unit.updated$.pipe(
            startWith(null), // Ensure we capture the initial state
            map(() => unit.errors != null && unit.errors.length > 0)
          )
        );
        // Combine the latest error states from all units
        return combineLatest(unitErrorObservables).pipe(
          map(unitErrors => unitErrors.some(hasError => hasError))
        );
      })
    );
    this.hasErrors$ = combineLatest([this.platoonHasErrors$, this.unitsHaveErrors$]).pipe(
      map(([platoonHasErrors, unitsHaveErrors]) => platoonHasErrors || unitsHaveErrors)
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

  validate(units: Unit[]): string[] | null {
    const errors: string[] = [];

    this.selector.unitRequirements.forEach(r => {
      const unitsForRequirement = units.filter(u => u.slotId == r.id);
      if (r.maxPerUnit) {
        const otherUnitsCount = units.length - unitsForRequirement.length;
        const max = otherUnitsCount * r.maxPerUnit;
        // todo: requirement/Name
        if (unitsForRequirement.length > max) errors.push(`You have ${unitsForRequirement.length} ${r.requirementName} but this must be limited to ${max}.`);
      }

      if (r.minCarryAll) {
        const totalMen = units.reduce((total, unit) => total + (unit.men ?? 0), 0)
        const transportCapacity = 0; //Todo: get transport capacity from unitsForRequirement
        if (totalMen > transportCapacity) errors.push(`You have ${totalMen} men but only transport capacity for ${transportCapacity} men.`);
      }
    })

    return errors.length ? errors : null;
  }

  toStoredObject(): IPlatoonModel {
    return {
      id: this.id,
      selectorId: this.selector.id,
      platoonName: this.platoonName ?? null,
      units: this.units$.getValue().map(u => u.toStoredObject()),
      order: 0
    };
  }
}
