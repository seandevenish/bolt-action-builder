import { Component, signal, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../user/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../components/icon';

@Component({
  selector: 'app-user-nav',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, IconComponent],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.scss'
})
export class UserNavComponent {

  isLoggedIn = signal(false);
  username = signal<string | null>(null); // Signal for the user's name
  avatarUrl = signal<string | null>(null); // Signal for the user's avatar URL

  constructor(private _authService: AuthService,
    private readonly _router: Router
  ) {
    this._authService.state$.subscribe(user => {
      this.isLoggedIn.set(!!user); // Set to true if a user object exists, false otherwise
      this.username.set(user ? user.displayName ?? user.email : null); // Set the username or null if not logged in
      this.avatarUrl.set(user ? user.photoURL : null); // Set the avatar URL or null if not logged in
    });
  }

  signout() {
    this._authService.signout().then(() => {
      this._router.navigate(['login']);
    });
  }

}
