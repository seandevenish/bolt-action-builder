import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../user/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.state$.pipe(
    map(user => {
      if (user && user.uid) {
        return true; // Allow access if the user is logged in
      } else {
        router.navigate(['/login']); // Redirect to the login page if not logged in
        return false; // Block access
      }
    })
  );
};
