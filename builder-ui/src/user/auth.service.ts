import { Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider  } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  state$: Observable<any>;
  state: any;

  constructor(public auth: Auth) {
    this.state$ = authState(this.auth);
    this.state = this.state$.subscribe(s => this.state = s);
  }

  registerWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  signout() {
    this.auth.signOut();
  }
}
