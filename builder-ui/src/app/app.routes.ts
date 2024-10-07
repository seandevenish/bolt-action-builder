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
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'armies',
        loadComponent: () =>
          import('../armies/armies-list/armies-list.component').then(
            (mod) => mod.ArmiesListComponent
          ),
      },
    ]
  }

];
