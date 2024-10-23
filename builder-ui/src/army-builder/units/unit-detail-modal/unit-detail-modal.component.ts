import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ArmyFormComponent } from '../../armies/army-form/army-form.component';
import { IUnit } from '../unit.class';
import { CommonModule } from '@angular/common';
import { Experience } from '../experience.enum';

@Component({
  selector: 'app-unit-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-detail-modal.component.html',
  styleUrl: './unit-detail-modal.component.scss'
})
export class UnitDetailModalComponent {

  form: FormGroup;
  unit: IUnit;

  private readonly _unsubscribeAll$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ArmyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder
  ) {
    this.unit = data.unit as IUnit;
    this.form = this._formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(128)]],
      experience: [null, Validators.required],
      description: [null, [Validators.maxLength(1024)]],
      men: [1, Validators.required]
    })
    this.form.patchValue(data.unit);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next();
    this._unsubscribeAll$.complete();
  }

  submit() {
    if (this.form.invalid) return;
    // todo:
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
