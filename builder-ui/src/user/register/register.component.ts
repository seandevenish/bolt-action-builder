import { Component, signal } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseError } from 'firebase/app';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../app/components/spinner/spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  error = signal<string|null>(null);
  registerForm: FormGroup;
  busy = {
    submit: signal(false)
  };

  state$: any;

  constructor(private _formBuilder: FormBuilder,
    private _router: Router,
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

  public registerWithGoogle() {
    this.busy.submit.set(true);
    this.authService.loginWithGoogle()
      .then((result) => {
        console.log('Google login successful', result);
        this.busy.submit.set(false);
        this.onSuccess();
      })
      .catch((error) => {
        this.handleError(error);
        this.busy.submit.set(false);
      });
  }
  
  public registerWithFacebook() {
    this.busy.submit.set(true);
    this.authService.loginWithFacebook()
      .then((result) => {
        console.log('Facebook login successful', result);
        this.busy.submit.set(false);
        this.onSuccess();
      })
      .catch((error) => {
        this.handleError(error);
        this.busy.submit.set(false);
      });
  }

  public register() {
    if (this.registerForm.valid) {
      this.busy.submit.set(true);
      const { email, password } = this.registerForm.value;
      this.authService.registerWithEmail(email, password)
        .then((result) => {
          console.log('Registration successful', result);
          this.busy.submit.set(false);
          this.onSuccess();
        })
        .catch((error) => {
          this.handleError(error);
          this.busy.submit.set(false);
        });
    }
  }

  private handleError(error: FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        this.error.set('This email address is already in use. Please try another one.');
        break;
      case 'auth/invalid-email':
        this.error.set('The email address is not valid. Please enter a valid email.');
        break;
      case 'auth/weak-password':
        this.error.set('The password is too weak. Please enter a stronger password (at least 6 characters).');
        break;
      default:
        this.error.set('An unexpected error occurred. Please try again.');
    }
  }

  private onSuccess() {
    this._router.navigate(['armies']);
  }

}
