import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/armies',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../user/login/login.component').then(
        (mod) => mod.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../user/register/register.component').then(
        (mod) => mod.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('../user/forgot-password/forgot-password.component').then(
        (mod) => mod.ForgotPasswordComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'armies',
        loadComponent: () =>
          import('../army-builder/armies/armies-list/armies-list.component').then(
            (mod) => mod.ArmiesListComponent
          ),
      },
      {
        path: 'armies/:armyId',
        loadComponent: () =>
          import('../army-builder/armies/army-root/army-root.component').then(
            (mod) => mod.ArmyRootComponent
          ),
      },
    ]
  }

];
