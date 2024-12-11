import { Component, signal } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseError } from 'firebase/app';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../app/components/spinner/spinner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {

  success = signal(false);
  error = signal<string|null>(null);
  form: FormGroup;
  busy = {
    submit: signal(false)
  };

  state$: any;

  constructor(private _formBuilder: FormBuilder,
    public authService: AuthService) {

    this.form = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public submit() {
    this.error.set(null);
    this.success.set(false);
    this.busy.submit.set(true);
    this.authService.passwordReset(this.form.value.email)
      .then(() => {
        this.success.set(true);
      })
      .catch((error: FirebaseError) => {
        this.error.set('Failed to send password reset email: ' + error.message);
      })
      .finally(() => this.busy.submit.set(false));
  }

}
