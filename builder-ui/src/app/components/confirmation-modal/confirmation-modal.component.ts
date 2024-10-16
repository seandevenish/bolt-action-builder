import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {

  @Input() text?: string;
  @Input() actionText?: string;
  @Input() passPhrase?: string;
  @Input() danger = false;

  form: FormGroup;
  passPhraseHtml: string|null = null;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder) {
      this.text = data.text;
      this.actionText = data.actionText;
      this.passPhrase = data.passPhrase;
      this.danger = data.danger;
      this.form = this._formBuilder.group({
        passPhrase: [null as null|string]
      });
   }

  ngOnInit() {
    if (this.passPhrase) {
      this.passPhraseHtml = this.encodePassPhrase(this.passPhrase);
      this.form.controls['passPhrase'].setValidators([Validators.required, passPhraseValidator(this)]);
    }
  }

  confirm() {
    if (this.passPhrase) {
      this.form.markAsTouched();
      if (!this.form.valid) return;
    }
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private encodePassPhrase(str: string) {
    return '<span>' + str.toString().split('').map(function(c) {
     if (c === ' ') return '&nbsp;';
     else return c;
    }).join('') + '</span>';
  }

}

function passPhraseValidator(component: ConfirmationModalComponent): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!component.passPhrase) return null;
    const phrase = component.passPhrase.toString();
    if (control.value && (control.value !== phrase)) {
      return { passPhrase: true };
    }
    return null;
  };
}
