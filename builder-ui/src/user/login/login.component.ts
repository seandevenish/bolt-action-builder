import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FirebaseError } from 'firebase/app';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { filter, take } from 'rxjs';
import { SpinnerComponent } from '../../app/components/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, MatProgressSpinnerModule, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  error?: string;
  loginForm: FormGroup;
  busy = {
    submit: signal(false)
  };

  state$: any;

  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router
  ) {
    this.state$ = _authService.state$;

    this.state$.subscribe((s: any) => {
      console.log('login state', s);
    })

    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {

  }

  public loginWithGoogle() {
    this._authService.loginWithGoogle();
  }

  public loginWithFacebook() {
    this._authService.loginWithFacebook();
  }

  public loginWithEmail() {
    if (this.loginForm.valid) {
      this.busy.submit.set(true);
      const { email, password } = this.loginForm.value;
      this._authService.loginWithEmail(email, password)
        .then((result) => {
          console.log('Registration successful', result);
          this.busy.submit.set(false);
          this._authService.state$.pipe(
            filter(authState => authState !== null),
            take(1) // Complete after getting the first non-null value
          ).subscribe(() => {
            this._router.navigate(['armies']);
          });
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
