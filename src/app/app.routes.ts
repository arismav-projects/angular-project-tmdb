import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'collections',
    loadChildren: () =>
      import('@features/collections/collections.routes').then((module) =>
        module.collectionsRoutes(),
      ),
  },
  {
    path: 'search',
    loadChildren: () =>
      import('@features/search/search.routes').then((module) => module.searchRoutes()),
  },
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: '**', redirectTo: 'search' },
];
