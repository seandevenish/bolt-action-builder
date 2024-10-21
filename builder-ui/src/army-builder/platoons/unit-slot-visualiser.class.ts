import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, scan, share, startWith, Subject, tap } from "rxjs";
import { UnitSelector } from "../units/unit-selector.class";
import { IUnit } from "../units/unit.class";
import { UnitRequirement } from "./unit-requirement.interface";
import { toSignal } from '@angular/core/rxjs-interop';
import { UnitType } from "../units/unit-type.enum";

export interface ISlot {
  isMandatory: boolean;
  upToQty?: number;
}

export class UnitSlotVisualiser {

  private readonly requirement: UnitRequirement;

  private readonly unitActions$ = new Subject<{ action: 'add' | 'remove' | 'removeAll', units?: IUnit[] }>();

  private readonly selectedUnits$ = this.unitActions$.pipe(
    scan((currentUnits, { action, units }) => {
      switch (action) {
        case 'add':
          return [...currentUnits, ...units!];
        case 'remove':
          return currentUnits.filter(u => !units!.some(removeUnit => removeUnit === u));
        case 'removeAll':
          return [];
        default:
          return currentUnits;
      }
    }, [] as IUnit[]),
    startWith([])
  );

  private readonly allPlatoonUnits$ = new BehaviorSubject<IUnit[]>([]);
  private readonly otherPlatoonUnits$ = combineLatest({
    selected: this.selectedUnits$,
    all: this.allPlatoonUnits$
  }).pipe(
    debounceTime(50),
    map(({ selected, all }) =>
      all.filter(unit => !selected.some(selectedUnit => selectedUnit === unit))
    ),
    share()
  );

  private readonly max$ = this.otherPlatoonUnits$.pipe(
    map(m => this.calculateMax(this.requirement, m))
  );
  private readonly min$ = this.otherPlatoonUnits$.pipe(
    map(m => this.calculateMin(this.requirement, m))
  );

  get title() {
    const firstType = this.requirement?.types?.[0];

    if (this.requirement?.requirementName) {
      return this.requirement.requirementName;
    }

    if (firstType && UnitType.hasOwnProperty(firstType)) {
      return UnitType[firstType as keyof typeof UnitType]; // Return the value associated with the key
    }

    if (firstType && Object.values(UnitType).includes(firstType)) {
      return firstType;
    }

    return 'Unknown Type';
  }


  groupable = toSignal(this.max$.pipe(map(m => m == 1)));

  remainingMandatorySlots$ = combineLatest({
    min: this.min$,
    selected: this.selectedUnits$
  }).pipe(
    map(m => Math.max((m.min ?? 0) - m.selected.length, 0)),
    distinctUntilChanged(),
  );

  remainingOptionalSlots$ = combineLatest({
    max: this.max$,
    min: this.min$,
    selected: this.selectedUnits$
  }).pipe(
    map(m => Math.max((m.max ?? 0) - m.selected.length - (m.min ?? 0), 0)),
    distinctUntilChanged()
  );

  units = toSignal(this.selectedUnits$);
  slots = toSignal(combineLatest({
    mandatory: this.remainingMandatorySlots$.pipe(map(q => {
      return new Array(q).fill({
        isMandatory: true
      })
    })),
    optional: this.remainingOptionalSlots$.pipe(
      map(q => q ? [{
        isMandatory: false,
        upToQty: q
      }] : [])
    )
  }).pipe(
    map(r => [...r.mandatory, ...r.optional]),
    tap(s => console.log(s))
  ));

  availableUnitSelectors: UnitSelector[] = [];

  updated$ = new Subject<UnitSlotVisualiser>();

  constructor(requirement: UnitRequirement, unitSelectors: UnitSelector[]) {
    this.requirement = requirement;
    const { types, subTypes, excludeSubTypes } = this.requirement;
    this.availableUnitSelectors = unitSelectors.filter(s => {
      // Check if the unitType is allowed
      if (!types.includes(s.unitType)) {
        return false;
      }

      // Check if subTypes match, if subTypes are defined
      if (subTypes && s.subType && !subTypes.includes(s.subType)) {
        return false;
      }

      // Check if subTypes are excluded, if excludeSubTypes are defined
      if (excludeSubTypes && s.subType && excludeSubTypes.includes(s.subType)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Adds a selected unit to the visualizer.
   * @param unit The unit to add.
   */
  addUnit(unit: IUnit): void {
    this.addUnits([unit]);
  }

  /**
   * Adds multiple units to the visualizer in a single update.
   * @param units The array of units to add.
   */
  addUnits(units: IUnit[]): void {
    this.unitActions$.next({ action: 'add', units });
    this.updated$.next(this);
  }

  /**
   * Removes a selected unit from the visualizer.
   * @param unit The unit to remove.
   */
  removeUnit(unit: IUnit): void {
    this.unitActions$.next({ action: 'remove', units: [unit] });
    this.updated$.next(this);
  }

  /**
   * Removes all units from the visualizer.
   */
  removeAllUnits(): void {
    this.unitActions$.next({ action: 'removeAll' });
    this.updated$.next(this);
  }

  private calculateMax(requirement: UnitRequirement, otherPlatoonUnits: IUnit[]): number | null {
    if (requirement.max != null) return requirement.max;
    if (requirement.maxPerUnit == null) return null;
    return otherPlatoonUnits.length * requirement.maxPerUnit;
  }

  private calculateMin(requirement: UnitRequirement, otherPlatoonUnits: IUnit[]) {
    if (requirement.min != null) return requirement.min;
    if (requirement.minPerUnit == null) return null;
    return otherPlatoonUnits.length * requirement.minPerUnit;
  }

}
