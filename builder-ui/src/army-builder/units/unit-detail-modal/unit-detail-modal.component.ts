import { Component, Inject, signal, WritableSignal, Signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil, tap } from 'rxjs';
import { ArmyFormComponent } from '../../armies/army-form/army-form.component';
import { Unit } from '../unit.class';
import { UnitFactory } from "../unit-factory";
import { CommonModule } from '@angular/common';
import { Experience } from '../experience.enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unit-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './unit-detail-modal.component.html',
  styleUrl: './unit-detail-modal.component.scss'
})
export class UnitDetailModalComponent {

  form: FormGroup;
  unit: Unit;
  private _unsavedUnit: Unit;
  unsavedUnit: WritableSignal<Unit>;
  cost: Signal<number>;

  private readonly _unsubscribeAll$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ArmyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder
  ) {
    this.unit = data.unit as Unit;
    this._unsavedUnit = UnitFactory.loadUnit(data.unit, data.unit.selector, data.library);
    this.unsavedUnit = signal(this._unsavedUnit);
    this.cost = signal(this.unsavedUnit().cost); //Todo: this should be calculated
    this.form = this._formBuilder.group({
      name: [null, [Validators.maxLength(128)]],
      experience: [null, Validators.required],
      description: [null, [Validators.maxLength(1024)]],
      men: [1, Validators.required]
    })
    this.form.patchValue(data.unit);
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      tap(v => {
        Object.assign(this._unsavedUnit, v);
        this._unsavedUnit.refresh();
        this.unsavedUnit.set(this._unsavedUnit);
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
      action: 'Updated',
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
}
