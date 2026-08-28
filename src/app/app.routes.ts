import { Route, Routes } from '@angular/router';

/// Shared movie-details route for pages that open a film.
/// Keeping it as a child route lets the current page stay mounted behind the dialog.
const movieDetailsRoute: Route = {
  path: 'movie/:id',
  loadChildren: () => import('@features/movie-details/movie-details.routes').then((m) => m.routes),
};

export const routes: Routes = [
  {
    path: 'collections',
    loadChildren: () =>
      import('@features/collections/collections.routes').then((m) =>
        m.collectionsRoutes([movieDetailsRoute]),
      ),
  },
  {
    // Keep dialog URLs nested under `/search`.
    path: 'search',
    loadChildren: () =>
      import('@features/search/search.routes').then((m) => m.searchRoutes([movieDetailsRoute])),
  },
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: '**', redirectTo: 'search' },
];
