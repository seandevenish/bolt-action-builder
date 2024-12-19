import { Component, HostListener, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Army } from '../army.class';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, filter, map, Subject, takeUntil, tap } from 'rxjs';
import { ArmyService } from '../army.service';
import { FirestoreError } from 'firebase/firestore';
import { generateGuid } from '../../../app/utilities/guid';
import { Faction, factionLibrary } from '../../faction';
import { SpinnerComponent } from '../../../app/components/spinner/spinner.component';

@Component({
  selector: 'app-army-form',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule, SpinnerComponent],
  templateUrl: './army-form.component.html',
  styleUrls: ['./army-form.component.scss'],
})
export class ArmyFormComponent implements OnInit, OnDestroy {

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed(event: KeyboardEvent) {
    this.dialogRef.close();
  }

  isAdd: boolean;
  id: string;
  form: FormGroup;
  error?: string;

  factions: Faction[] = factionLibrary;
  saving = signal(false);
  get faction(): FormControl { return this.form.get('faction') as FormControl; }
  get name(): FormControl { return this.form.get('name') as FormControl; }

  private _unsubscribeAll$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ArmyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _armyService: ArmyService
  ) {
    this.isAdd = data.id === 'add';
    this.id = this.isAdd ? generateGuid() : data.id;

    this.form = this._formBuilder.group({
      name: [null, [Validators.required, Validators.maxLength(128)]],
      description: [null, [Validators.maxLength(1024)]],
      faction: [
        { value: null, disabled: !this.isAdd },
        [Validators.required]
      ]
    })
    this.form.patchValue(data.army);
  }

  ngOnInit(): void {
    if (!this.isAdd) return;

    this.form.get('faction')!.valueChanges.pipe(
      map(r => r.name),
      distinctUntilChanged(),
      filter(r => !!r),
      tap(r => this.form.get('name')?.setValue(r + ' - Army List')),
      takeUntil(this._unsubscribeAll$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next();
    this._unsubscribeAll$.complete();
  }

  submit() {
    if (this.form.invalid) return;

    const army = new Army({...this.data.army, ...this.form.value});
    army.loadProperties(factionLibrary);

    if (!this.isAdd) {
      this.dialogRef.close(army);
      return;
    }

    this.saving.set(true);
    this._armyService.add(army.toStoredObject()).then(() =>
      this.dialogRef.close(army)
    ).catch((e: FirestoreError) => {
      this.error = e.message;
    }).finally(() => this.saving.set(false));
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
