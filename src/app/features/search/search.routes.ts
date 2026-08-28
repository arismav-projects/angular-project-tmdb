import { Routes } from '@angular/router';

/// Child route hosts movie details over the results page.
export function searchRoutes(children: Routes = []): Routes {
  return [
    {
      path: '',
      loadComponent: () => import('./feature/search-page/search-page').then((m) => m.SearchPage),
      title: 'Search movies',
      children: [{ path: '', children: [] }, ...children],
    },
  ];
}
