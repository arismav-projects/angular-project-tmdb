import { toAppError } from '@core/http/http-error.mapper';
import { AppError } from '@core/models/app-error';
import { emptyPage, Paginated } from '@core/models/paginated.model';
import { Movie, MovieService, MovieSnapshot, toSnapshot } from '@domain/movies';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

type SearchStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface SearchState {
  readonly query: string;
  readonly page: number;
  readonly results: Paginated<Movie>;
  readonly status: SearchStatus;
  readonly error: AppError | null;
}

@Injectable({ providedIn: 'root' })
export class SearchFacade {
  private readonly movies = inject(MovieService);

  // Query, page and request result change as one state.
  private readonly state = signal<SearchState>({
    query: '',
    page: 1,
    results: emptyPage<Movie>(),
    status: 'idle',
    error: null,
  });

  // Selection is independent from search requests.
  private readonly _selection = signal<readonly MovieSnapshot[]>([]);

  // Changing this value retries the current request.
  private readonly attempt = signal(0);

  readonly query = computed(() => this.state().query);
  readonly page = computed(() => this.state().page);
  readonly results = computed(() => this.state().results);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);

  readonly selectedCount = computed(() => this._selection().length);

  readonly selectedIds = computed(() => new Set(this._selection().map((movie) => movie.id)));

  constructor() {
    effect((onCleanup) => {
      const query = this.query();
      const page = this.page();
      this.attempt();

      if (query === '') {
        this.state.update((current) => ({
          ...current,
          results: emptyPage<Movie>(),
          status: 'idle',
          error: null,
        }));
        return;
      }

      this.state.update((current) => ({ ...current, status: 'loading', error: null }));

      const subscription = this.movies.search(query, page).subscribe({
        next: (results) => {
          this.state.update((current) => ({
            ...current,
            results,
            status: 'loaded',
            error: null,
          }));
        },
        error: (error: unknown) => {
          this.state.update((current) => ({
            ...current,
            status: 'error',
            error: toAppError(error),
          }));
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  setQuery(next: string): void {
    const query = next.trim();

    this.state.update((current) =>
      query === current.query ? current : { ...current, query, page: 1 },
    );
  }

  setPage(page: number): void {
    this.state.update((current) => (page === current.page ? current : { ...current, page }));
  }

  retry(): void {
    this.attempt.update((count) => count + 1);
  }

  selection(): readonly MovieSnapshot[] {
    return this._selection();
  }

  toggleSelection(movie: Movie, isSelected: boolean): void {
    this._selection.update((current) => {
      const without = current.filter((selected) => selected.id !== movie.id);

      return isSelected ? [...without, toSnapshot(movie)] : without;
    });
  }

  clearSelection(): void {
    this._selection.set([]);
  }
}
