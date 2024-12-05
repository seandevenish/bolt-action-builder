import { Library } from "../units/library.interface";
import { Platoon } from '../platoons/platoon.class';
import { Army } from '../armies/army.class';
import { BehaviorSubject, combineLatest, map, merge, Observable, Subject, switchMap, tap, withLatestFrom } from "rxjs";
import { ForceSelector } from "./force-selector";
import { PlatoonCategory } from "../platoons/platoon-category.enum";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

export class Force {
  army: Army;
  readonly library: Library;
  readonly selector: ForceSelector;

  readonly platoons$: BehaviorSubject<Platoon[]>;
  readonly errors$: Observable<string[] | null>;
  readonly cost$: Observable<number>;
  cost: number = 0;

  private readonly platoonChangeTrigger$ = new Subject<void>();
  readonly updated$: Observable<void>;

  readonly platoonsHaveErrors$: Observable<boolean>;
  readonly hasErrors$: Observable<boolean>;

  constructor(army: Army, selector: ForceSelector, library: Library, platoons: Platoon[]) {

    this.army = army;
    this.selector = selector;
    this.library = library;

    this.platoons$ = new BehaviorSubject(platoons);
    this.errors$ = this.platoons$.pipe(
      map(u => this.validate(u))
    );

    // Updated observable emits whenever platoons$ changes or individual platoons update
    this.updated$ = merge(
      this.platoonChangeTrigger$,
      this.platoons$.pipe(
        switchMap(platoonsArray =>
          merge(
            ...platoonsArray.map(unit => unit.updated$),
            this.platoons$.pipe(map(() => undefined))
          )
        )
      )
    );

    this.cost$ = this.updated$.pipe(
      withLatestFrom(this.platoons$),
      switchMap(([, platoons]) =>
        combineLatest(platoons.map(platoon => platoon.cost$)).pipe(
          map(costs => costs.reduce((total, cost) => total + cost, 0))
        )
      ),
      tap(v => this.cost = v)
    );

    this.platoonsHaveErrors$ = this.updated$.pipe(
      withLatestFrom(this.platoons$),
      switchMap(([, platoons]) =>
        combineLatest(platoons.map(p2 => p2.hasErrors$)).pipe(
          map(errorsArray => errorsArray.some(hasError => hasError))
        )
      )
    );
    this.hasErrors$ = combineLatest([this.errors$, this.platoonsHaveErrors$]).pipe(
      map(([errors, platoonHasErrors]) => !!errors || platoonHasErrors)
    );
  }

  validate(platoons: Platoon[]): string[] | null {
    const errors: string[] = [];

    const hqPlatoons = platoons.filter(p => p.selector.platoonCategory == PlatoonCategory.HQ).length;
    if (hqPlatoons > 1) errors.push('You may only have 1 Company HQ platoon.');

    if (this.selector.infantryMinRequirement) {
      const infantryCount = platoons.filter(p => p.selector.platoonCategory == PlatoonCategory.Infantry).length;
      const platoonCountsBySelectorId = platoons.reduce((acc, platoon) => {
        acc[platoon.selector.id] = (acc[platoon.selector.id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const maxCount = Math.max(...Object.values(platoonCountsBySelectorId));
      if (maxCount > infantryCount) {
        errors.push(`You must have at least ${maxCount} infantry platoons to support the current platoon structure.`);
      }
    }

    return errors.length ? errors : null;
  }

  addPlatoon(platoon: Platoon, index?: number): void {
    const currentPlatoons = this.platoons$.getValue();

    const safeIndex = index !== undefined && index >= 0 && index <= currentPlatoons.length
        ? index
        : currentPlatoons.length;

    const newPlatoons = [
        ...currentPlatoons.slice(0, safeIndex),
        platoon,
        ...currentPlatoons.slice(safeIndex)
    ];

    this.platoons$.next(newPlatoons);
    this.platoonChangeTrigger$.next(); // Emit update
}


  deletePlatoon(index: number): void {
    const currentPlatoons = this.platoons$.getValue();
    if (index >= 0 && index < currentPlatoons.length) {
      this.platoons$.next(currentPlatoons.filter((_, i) => i !== index));
      this.platoonChangeTrigger$.next(); // Emit update
    }
  }

  reorderPlatoon(previousIndex: number, currentIndex: number): void {
    const currentPlatoons = this.platoons$.getValue();
    moveItemInArray(currentPlatoons, previousIndex, currentIndex);
    this.platoons$.next([...currentPlatoons]);
    this.platoonChangeTrigger$.next(); // Emit update
  }
}
