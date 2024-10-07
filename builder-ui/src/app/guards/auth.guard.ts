import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../user/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.state) {
    router.navigate(['/login']); // Redirect to the login page if the user is not logged in
    return false; // Block access to this page
  }
  return true; // Allow access to the requeseted page
};
