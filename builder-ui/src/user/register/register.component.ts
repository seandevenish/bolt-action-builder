import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  error?: string;
  registerForm: FormGroup;
  busy = {
    submit: false
  };

  state$: any;

  constructor(private _formBuilder: FormBuilder,
    public authService: AuthService) {
    this.state$ = authService.state$;

    this.state$.subscribe((s: any) => {
      console.log('login state', s);
    })

    this.registerForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  public loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  public register() {
    if (this.registerForm.valid) {
      this.busy.submit = true;
      const { email, password } = this.registerForm.value;
      this.authService.registerWithEmail(email, password)
        .then((result) => {
          console.log('Registration successful', result);
          this.busy.submit = false;
          // Optionally navigate to a different page after success
        })
        .catch((error) => {
          this.handleError(error);
          this.busy.submit = false;
        });
    }
  }

  private handleError(error: FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        this.error = 'This email address is already in use. Please try another one.';
        break;
      case 'auth/invalid-email':
        this.error = 'The email address is not valid. Please enter a valid email.';
        break;
      case 'auth/weak-password':
        this.error = 'The password is too weak. Please enter a stronger password (at least 6 characters).';
        break;
      default:
        this.error = 'An unexpected error occurred. Please try again.';
    }
  }

}
