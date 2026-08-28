import { toAppError } from '@core/http/http-error.mapper';
import { AppError, appErrorMessage } from '@core/models/app-error';
import { NotificationService } from '@core/services/notification.service';
import { GuestSessionService, isValidRating, MovieDetails, MovieService } from '@domain/movies';
import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, take } from 'rxjs';

interface MovieDetailsState {
  readonly movieId: number | null;
  readonly movie: MovieDetails | null;
  readonly status: 'loading' | 'loaded' | 'error';
  readonly error: AppError | null;
}

interface RatingState {
  readonly pending: boolean;
  readonly submitted: number | null;
}

@Injectable()
export class MovieDetailsFacade {
  private readonly movies = inject(MovieService);
  private readonly guestSession = inject(GuestSessionService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // Movie id and request result change as one state.
  private readonly state = signal<MovieDetailsState>({
    movieId: null,
    movie: null,
    status: 'loading',
    error: null,
  });

  private readonly movieId = computed(() => this.state().movieId);

  // Changing this value retries the current request.
  private readonly attempt = signal(0);

  // Pending and submitted rating reset together when the movie changes.
  private readonly rating = linkedSignal<number | null, RatingState>({
    source: this.movieId,
    computation: () => ({ pending: false, submitted: null }),
  });

  readonly movie = computed(() => this.state().movie);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly error = computed(() => this.state().error);

  readonly ratingPending = computed(() => this.rating().pending);
  readonly submittedRating = computed(() => this.rating().submitted);

  constructor() {
    effect((onCleanup) => {
      const id = this.movieId();
      this.attempt();

      if (id === null) {
        return;
      }

      this.state.update((current) => ({
        ...current,
        movie: null,
        status: 'loading',
        error: null,
      }));

      const subscription = this.movies.getDetails(id).subscribe({
        next: (movie) => {
          this.state.update((current) => ({
            ...current,
            movie,
            status: 'loaded',
            error: null,
          }));
        },
        error: (error: unknown) => {
          this.state.update((current) => ({
            ...current,
            movie: null,
            status: 'error',
            error: toAppError(error),
          }));
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  load(id: number): void {
    this.state.update((current) =>
      id === current.movieId
        ? current
        : { ...current, movieId: id, movie: null, status: 'loading', error: null },
    );
  }

  retry(): void {
    this.attempt.update((count) => count + 1);
  }

  rate(value: number): void {
    const id = this.movieId();

    if (id === null) {
      return;
    }

    // Validate again at the facade boundary before TMDB can reject the value.
    if (!isValidRating(value)) {
      this.notifications.error('Ratings run from 0.5 to 10, in half-point steps.');
      return;
    }

    this.rating.update((current) => ({ ...current, pending: true }));

    // Capture now; the visible film may change before the request resolves.
    const title = this.movie()?.title;

    this.guestSession
      .current()
      .pipe(
        take(1),
        switchMap((session) => this.movies.rate(id, value, session.id)),
        finalize(() => {
          if (this.movieId() === id) {
            this.rating.update((current) => ({ ...current, pending: false }));
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notifications.success(
            title === undefined
              ? `Rated ${value} out of 10.`
              : `Rated ${title} ${value} out of 10.`,
          );

          if (this.movieId() === id) {
            this.rating.update((current) => ({ ...current, submitted: value }));
          }
        },
        error: (error: unknown) => {
          this.notifications.error(appErrorMessage(toAppError(error)));
        },
      });
  }
}
