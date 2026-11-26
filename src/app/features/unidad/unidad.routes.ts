

import { Routes } from '@angular/router';

export const UNIDAD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/unidad-page/unidad-page').then((m) => m.UnidadPage),
  },
];