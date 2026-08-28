import { Routes } from '@angular/router';

import { MovieDetailsFacade } from './data-access/movie-details.facade';

export const routes: Routes = [
  {
    path: '',
    providers: [MovieDetailsFacade],
    loadComponent: () =>
      import('./feature/movie-details-route/movie-details-route').then((m) => m.MovieDetailsRoute),
    title: 'Film details',
  },
];
