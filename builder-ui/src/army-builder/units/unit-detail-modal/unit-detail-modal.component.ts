import { IInfantryWeaponOption } from './../unit-selector.class';
import { Component, Inject, signal, WritableSignal, Signal, computed } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { max, Subject, takeUntil, tap } from 'rxjs';
import { ArmyFormComponent } from '../../armies/army-form/army-form.component';
import { InfantryUnit, Unit } from '../unit.class';
import { UnitFactory } from "../unit-factory";
import { CommonModule } from '@angular/common';
import { Experience } from '../experience.enum';
import { MatIconModule } from '@angular/material/icon';
import { InfantryUnitSelector, UnitSelector } from '../unit-selector.class';

@Component({
  selector: 'app-unit-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './unit-detail-modal.component.html',
  styleUrl: './unit-detail-modal.component.scss'
})
export class UnitDetailModalComponent {

  form: FormGroup;
  unit: Unit|InfantryUnit;
  readonly _unsavedUnit: Unit;
  readonly selector: UnitSelector;
  readonly cost: WritableSignal<number>;

  readonly isInfantry: boolean = false;

  get experience() {
    return this.form.get('experience')!.value as Experience;
  }

  get infantryUnitSelector(): InfantryUnitSelector | null {
    return this.selector instanceof InfantryUnitSelector ? this.selector : null;
  }

  get infantryUnit(): InfantryUnit | null {
    return this.unit instanceof InfantryUnit ? this.unit : null;
  }

  private readonly _unsubscribeAll$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ArmyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder
  ) {
    this.unit = data.unit as Unit;
    this._unsavedUnit = UnitFactory.loadUnit(data.unit, data.unit.selector, data.library);
    this.cost = signal(this.unit.cost);
    this.selector = data.unit.selector;
    this.isInfantry = this.selector instanceof InfantryUnitSelector;
    this.form = this._formBuilder.group({
      name: [null, [Validators.maxLength(128)]],
      experience: [null, Validators.required],
      description: [null, [Validators.maxLength(1024)]]
    })

    if (this.isInfantry) {
      this.initializeInfantryUnitFormControls();
    }
    this.form.patchValue(data.unit);
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      tap(v => {
        Object.assign(this._unsavedUnit, v);
        this._unsavedUnit.refresh();
        this.cost.set(this._unsavedUnit.cost);
      }),
      takeUntil(this._unsubscribeAll$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next();
    this._unsubscribeAll$.complete();
  }

  submit() {
    if (this.form.invalid) return;
    Object.assign(this.unit, this.form.value);
    this.unit.refresh();
    this.dialogRef.close({
      action: 'Saved',
      unit: this.unit
      });
  }

  delete() {
    this.dialogRef.close({
      action: 'Delete'
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  /** Private method to initialize infantry-specific form controls */
  private initializeInfantryUnitFormControls() {
    if (this.infantryUnitSelector == null || this.infantryUnit == null) return;

    // Cast the unit as InfantryUnit
    const infantryUnit = this.unit as InfantryUnit;

    // Add 'men' control
    this.form.addControl('men', this._formBuilder.control(
      infantryUnit.men || this.infantryUnitSelector.baseMen || 1, Validators.required));

    // Initialize 'keyPersonWeaponSelected' as a boolean FormControl
    if (this.infantryUnitSelector!.keyPersonWeaponOptions.length >= 1) {
      this.form.addControl('keyPersonWeaponId', this._formBuilder.control(
        infantryUnit.keyPersonWeapon || null));
    }

    // Initialize 'generalWeaponIds' FormGroup
    const generalWeaponIdsGroup = this._formBuilder.group({});
    this.infantryUnitSelector!.generalWeaponOptions.forEach(option => {
      const quantity = infantryUnit.generalWeaponIds?.[option.weaponId] || 0;
      generalWeaponIdsGroup.addControl(option.weaponId, this._formBuilder.control(
        quantity, [Validators.min(0), Validators.max(option.max)]
      ));
    });
    this.form.addControl('generalWeaponIds', generalWeaponIdsGroup);
  }

}
