import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';

import { TMDB_CONFIG } from '@core/config/tmdb.config';
import { GlobalErrorHandler } from '@core/error/global-error-handler';
import { apiKeyInterceptor } from '@core/http/interceptors/api-key.interceptor';
import { authInterceptor } from '@core/http/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/http/interceptors/error.interceptor';
import { loadingInterceptor } from '@core/http/interceptors/loading.interceptor';
import { provideTmdbImageLoader } from '@core/image/tmdb-image-loader';
import { NotificationService } from '@core/services/notification.service';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // In a zoneless app this is how an error thrown inside an effect() becomes visible instead
    // of vanishing silently.
    provideBrowserGlobalErrorListeners(),

    provideHttpClient(
      withFetch(),
      withInterceptors([apiKeyInterceptor, authInterceptor, loadingInterceptor, errorInterceptor]),
    ),

    // No withInMemoryScrolling(): it drives the document scroller, while this app scrolls inside
    // the sidenav content pane. Shell owns that pane and exposes it through PageScrollService.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler(() => {
        inject(NotificationService).error(
          'That page could not be loaded. Check your connection and try again.',
        );
      }),
    ),

    { provide: TMDB_CONFIG, useValue: environment.tmdb },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // Without a loader NgOptimizedImage cannot build a srcset for TMDB, so every device
    // downloads the same full-size poster.
    provideTmdbImageLoader(),
  ],
};
