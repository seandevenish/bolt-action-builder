import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, scan, share, startWith, Subject, tap } from "rxjs";
import { UnitSelector } from "../units/unit-selector.class";
import { IUnit } from "../units/unit.class";
import { UnitRequirement } from "./unit-requirement.interface";
import { toSignal } from '@angular/core/rxjs-interop';
import { UnitType } from "../units/unit-type.enum";
import { Signal } from "@angular/core";

export interface ISlot {
  isMandatory: boolean;
  upToQty?: number;
}

export class UnitSlotVisualiser {

  public readonly groupable: boolean;
  public readonly title: string;
  public readonly availableUnitSelectors: UnitSelector[] = [];

  private readonly requirement: UnitRequirement;
  private readonly min: number | null;
  private readonly max: number | null | 'indeterminate';

  private readonly unitActions$ = new Subject<{ action: 'add' | 'remove' | 'removeAll', units?: IUnit[] }>();

  public readonly selectedUnits$ = this.unitActions$.pipe(
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
    startWith([] as IUnit[])
  );

  private readonly remainingMandatorySlots$: Observable<number>;
  private readonly remainingOptionalSlots$: Observable<number>;

  public readonly units: Signal<IUnit[] | undefined>;
  public readonly slots: Signal<any[] | undefined>;

  public updated$ = new Subject<UnitSlotVisualiser>();

  constructor(requirement: UnitRequirement, unitSelectors: UnitSelector[]) {
    this.requirement = requirement;
    this.title = this.calculateTitle(requirement);
    this.min = this.calculateMin(requirement);
    this.max = this.calculateMax(requirement);
    this.groupable = this.max == 1;
    const { types, subTypes, excludeSubTypes } = this.requirement;
    this.availableUnitSelectors = unitSelectors.filter(s => {
      if (!types.includes(s.unitType)) return false;
      if (subTypes && s.subType && !subTypes.includes(s.subType)) return false;
      if (excludeSubTypes && s.subType && excludeSubTypes.includes(s.subType)) return false;
      return true;
    });
    this.remainingMandatorySlots$ = this.selectedUnits$.pipe(
      map(m => Math.max((this.min ?? 0) - m.length, 0)),
      distinctUntilChanged(),
    );

    this.remainingOptionalSlots$ = this.selectedUnits$.pipe(
      map(m => this.max === 'indeterminate' ?
        1 :
        (this.max ?? 0) - (this.min ?? 0) - Math.max(m.length - (this.min ?? 0), 0)),
      distinctUntilChanged()
    );

    this.units = toSignal(this.selectedUnits$);

    this.slots = toSignal(combineLatest({
      mandatory: this.remainingMandatorySlots$.pipe(map(q => {
        return new Array(q).fill({
          isMandatory: true
        });
      })),
      optional: this.remainingOptionalSlots$.pipe(
        map(q => q ? [{
          isMandatory: false,
          upToQty: q
        }] : [])
      )
    }).pipe(
      map(r => [...r.mandatory, ...r.optional])
    ));
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

  private calculateTitle(requirement: UnitRequirement) {
    const firstType = requirement?.types?.[0];

    if (requirement?.requirementName) {
      return requirement.requirementName;
    }

    if (firstType && UnitType.hasOwnProperty(firstType)) {
      return UnitType[firstType as keyof typeof UnitType]; // Return the value associated with the key
    }

    if (firstType && Object.values(UnitType).includes(firstType)) {
      return firstType;
    }

    return 'Unknown Type';
  }

  private calculateMax(requirement: UnitRequirement): number | null | 'indeterminate' {
    if (requirement.max != null) return requirement.max;
    if (requirement.maxPerUnit == null) return null;
    return 'indeterminate';
  }

  private calculateMin(requirement: UnitRequirement) : number | null {
    if (requirement.min != null) return requirement.min;
    return null;
  }

  private initializeSlotCalculations(): void {
    // Initialize remaining slots

  }

  private initializeSignals(): void {
    // Initialize units and slots signals after remaining slots are set

  }

}
