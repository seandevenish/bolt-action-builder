import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, scan, share, shareReplay, startWith, Subject, tap } from "rxjs";
import { UnitSelector } from "../units/unit-selector.class";
import { UnitRequirement } from "./unit-requirement.interface";
import { toSignal } from '@angular/core/rxjs-interop';
import { UnitType } from "../units/unit-type.enum";
import { Signal } from "@angular/core";
import { Library } from "../units/library.interface";
import { Unit } from "../units/unit.class";

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

  private readonly unitActions$ = new Subject<{ action: 'add' | 'remove' | 'removeAll', units?: Unit[] }>();

  public readonly selectedUnits$: Observable<Unit[]>;

  private readonly remainingMandatorySlots$: Observable<number>;
  private readonly remainingOptionalSlots$: Observable<number>;

  public readonly units: Signal<Unit[] | undefined>;
  public readonly slots: Signal<any[] | undefined>;

  private _updated$ = new Subject<UnitSlotVisualiser>();
  public updated$ = this._updated$.asObservable();

  //todo: subscribe to update$ on units in visualiser

  constructor(requirement: UnitRequirement, units: Unit[], library: Library) {
    this.requirement = requirement;
    this.title = this.calculateTitle(requirement);
    this.min = this.calculateMin(requirement);
    this.max = this.calculateMax(requirement);
    this.groupable = this.max == 1;
    const { types, subTypes, excludeSubTypes } = this.requirement;
    this.availableUnitSelectors = library.unitSelectors.filter(s => {
      if (!types.includes(s.unitType)) return false;
      if (subTypes && s.subType && !subTypes.includes(s.subType)) return false;
      if (excludeSubTypes && s.subType && excludeSubTypes.includes(s.subType)) return false;
      return true;
    });

    // Seed the scan operator with initial units
    this.selectedUnits$ = this.unitActions$.pipe(
      startWith({ action: 'init', units }),
      scan((currentUnits, { action, units: actionUnits }) => {
        switch (action) {
          case 'init':
            return actionUnits || [];
          case 'add':
            return [...currentUnits, ...(actionUnits || [])];
          case 'remove':
            return currentUnits.filter(u => !(actionUnits || []).includes(u));
          case 'removeAll':
            return [];
          default:
            return currentUnits;
        }
      }, units),
      shareReplay(1)
    );

    this.remainingMandatorySlots$ = this.selectedUnits$.pipe(
      map(m => Math.max((this.min ?? 0) - m.length, 0)),
      distinctUntilChanged(),
    );

    this.remainingOptionalSlots$ = this.selectedUnits$.pipe(
      map(m => {
        const extraUnits = m.filter(u => u.selector.specialRuleIds?.includes("US_EXTRA_MMG")).length;
        const freeExtraUnits = extraUnits - Math.floor(extraUnits / 3);
        return m.length - freeExtraUnits;
      }),
      map(used => this.max === 'indeterminate' ?
        1 :
        (this.max ?? 0) - (this.min ?? 0) - Math.max(used - (this.min ?? 0), 0)),
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
  addUnit(unit: Unit): void {
    this.addUnits([unit]);
  }

  /**
   * Adds multiple units to the visualizer in a single update.
   * @param units The array of units to add.
   */
  addUnits(units: Unit[]): void {
    units.forEach(u => u.slotId = this.requirement.id);
    this.unitActions$.next({ action: 'add', units });
    this._updated$.next(this);
  }

  /**
   * Removes a selected unit from the visualizer.
   * @param unit The unit to remove.
   */
  removeUnit(unit: Unit): void {
    this.unitActions$.next({ action: 'remove', units: [unit] });
    this._updated$.next(this);
  }

  /**
   * Removes all units from the visualizer.
   */
  removeAllUnits(): void {
    this.unitActions$.next({ action: 'removeAll' });
    this._updated$.next(this);
  }

  private calculateTitle(requirement: UnitRequirement) {
    const firstType = requirement?.types?.[0];

    if (requirement?.requirementName) {
      return requirement.requirementName;
    }

    const plural = requirement.max == null || requirement.max > 1;

    if (firstType && UnitType.hasOwnProperty(firstType)) {
      return UnitType[firstType as keyof typeof UnitType] + (plural ? 's' : ''); // Return the value associated with the key
    }

    if (firstType && Object.values(UnitType).includes(firstType)) {
      return firstType + (plural ? 's' : '');
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

}
