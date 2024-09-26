import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/armies',
    pathMatch: 'full',
  },
  {
    path: 'armies',
    loadComponent: () =>
      import('../armies/armies-list/armies-list.component').then(
        (mod) => mod.ArmiesListComponent
      ),
  },
];
