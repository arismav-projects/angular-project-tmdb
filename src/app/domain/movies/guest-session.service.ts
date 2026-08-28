import { StorageService } from '@core/services/storage.service';
import { LOCAL_STORAGE_KEYS } from '@core/storage/local-storage.keys';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';

import { GuestSession, isGuestSessionValid } from './movie.model';
import { MovieService } from './movie.service';

function isStoredGuestSession(value: unknown): value is GuestSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<GuestSession>;

  return typeof candidate.id === 'string' && typeof candidate.expiresAt === 'number';
}

/// Creates, reuses, and refreshes the anonymous TMDB rating session.
/// The stored id is anonymous and not a secret.
@Injectable({ providedIn: 'root' })
export class GuestSessionService {
  private readonly storage = inject(StorageService);
  private readonly movies = inject(MovieService);

  /// Shared while creation is in flight so simultaneous ratings reuse one session.
  private creating: Observable<GuestSession> | null = null;

  current(): Observable<GuestSession> {
    const stored = this.storage.read(LOCAL_STORAGE_KEYS.guestSession, isStoredGuestSession);

    if (stored !== null && isGuestSessionValid(stored, Date.now())) {
      return of(stored);
    }

    this.creating ??= this.movies.createGuestSession().pipe(
      tap((session) => {
        this.storage.write(LOCAL_STORAGE_KEYS.guestSession, session);
      }),
      // Clear the cached request after success, error, or unsubscribe.
      finalize(() => {
        this.creating = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    return this.creating;
  }
}
