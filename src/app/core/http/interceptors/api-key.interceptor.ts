import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TMDB_CONFIG } from '../../config/tmdb.config';

export const apiKeyInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(TMDB_CONFIG);

  if (!request.url.startsWith(config.baseUrl)) {
    return next(request);
  }

  return next(request.clone({ params: request.params.set('api_key', config.apiKey) }));
};
