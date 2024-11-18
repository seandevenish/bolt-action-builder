import { IGeneralOptionSelector, IInfantryWeaponOption } from './../unit-selector.class';
import { Component, Inject, signal, WritableSignal, Signal, computed, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil, tap } from 'rxjs';
import { ArmyFormComponent } from '../../armies/army-form/army-form.component';
import { Unit } from '../unit.class';
import { InfantryUnit } from "../infantry-unit.class";
import { UnitFactory } from "../unit-factory";
import { CommonModule } from '@angular/common';
import { Experience } from '../experience.enum';
import { UnitSelector } from '../unit-selector.class';
import { InfantryUnitSelector } from '../infantry-unit-selector.class';
import { IconComponent } from '../../../app/components/icon';

@Component({
  selector: 'app-unit-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './unit-detail-modal.component.html',
  styleUrl: './unit-detail-modal.component.scss'
})
export class UnitDetailModalComponent {

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed(event: KeyboardEvent) {
    this.dialogRef.close();
  }

  form: FormGroup;
  unit: Unit|InfantryUnit;
  readonly selector: UnitSelector;
  readonly cost: WritableSignal<number>;
  readonly calculatedUnit: WritableSignal<Unit>;
  readonly validationErrors: WritableSignal<string[] | null>;

  readonly isInfantry: boolean = false;

  get experience() {
    return this.form.get('experience')!.value as Experience;
  }

  get hasWeapons() {
    return this.form.contains('keyPersonWeaponId') || this.form.contains('generalWeaponIds');
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
    this.cost = signal(this.unit.cost);
    this.calculatedUnit = signal(UnitFactory.loadUnit(data.unit, data.unit.selector, data.library));
    this.validationErrors = signal(this.unit.errors);
    this.selector = data.unit.selector;
    this.isInfantry = this.selector instanceof InfantryUnitSelector;
    this.form = this._formBuilder.group({
      name: [null, [Validators.maxLength(128)]],
      experience: [null, Validators.required],
      description: [null, [Validators.maxLength(1024)]]
    })

    if (this.selector.options?.length) {
      this.initialiseGeneralOptionControls(this.selector.options);
    }

    if (this.isInfantry) {
      this.initializeInfantryUnitFormControls();
    }
    this.form.patchValue(this.toForm(data.unit));
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      tap(v => {
        let unit = this.calculatedUnit();
        this.assignFormToUnit(v, unit)
        unit = UnitFactory.loadUnit(unit, unit.selector, unit.library);
        this.cost.set(unit.cost);
        this.calculatedUnit.set(unit);
        this.validationErrors.set(this.unit.errors)
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
    this.assignFormToUnit(this.form.value, this.unit);
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

  private initialiseGeneralOptionControls(options: IGeneralOptionSelector[]) {
    // Create form group for general options
    const optionsGroup = this._formBuilder.group({});

    // Add control for each option
    options.forEach(option => {
      optionsGroup.addControl(option.id, this._formBuilder.control(
        this.unit.optionIds.includes(option.id)
      ));
    });

    // Add options form group to main form
    this.form.addControl('optionIds', optionsGroup);
  }

  private toForm(unit: Unit): any {
    const unitForm = {...unit} as any;
    unitForm.optionIds = {};
    unit.optionIds?.forEach(i => {
      unitForm.optionIds[i] = true;
    })
    return unitForm;
  }

  private assignFormToUnit(formValue: any, unit: Unit) {
    const newValue = {
      ...formValue,
      optionIds: formValue.optionIds == null ? null : Object.entries(formValue.optionIds)
      .filter(([_, value]) => value === true)
      .map(([key]) => key)
    }
    Object.assign(unit, newValue);
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
    if (this.infantryUnitSelector!.generalWeaponOptions.length) {
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

}
