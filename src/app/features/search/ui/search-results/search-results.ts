import type { Movie } from '@domain/movies';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { MovieCard } from '@shared/ui/movie-card/movie-card';
import { Skeleton } from '@shared/ui/skeleton/skeleton';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

export interface MovieSelection {
  readonly movie: Movie;
  readonly isSelected: boolean;
}

export type SearchResultsState = 'idle' | 'loading' | 'empty' | 'ready' | 'error';

export interface SearchResultsPagination {
  readonly page: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
}

export interface SearchResultsVm {
  readonly movies: readonly Movie[];
  readonly state: SearchResultsState;
  readonly errorMessage: string;
  readonly selectedIds: ReadonlySet<number>;
  readonly pagination: SearchResultsPagination;
}

const numberFormatter = new Intl.NumberFormat('en-US');

@Component({
  selector: 'app-search-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatPaginatorModule, MovieCard, Skeleton, EmptyState],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
})
export class SearchResults {
  readonly vm = input.required<SearchResultsVm>();

  readonly open = output<number>();
  readonly selectionChange = output<MovieSelection>();
  readonly pageSelected = output<number>();
  readonly retry = output<void>();

  protected readonly isIdle = computed(() => this.vm().state === 'idle');
  protected readonly isLoading = computed(() => this.vm().state === 'loading');
  protected readonly isEmpty = computed(() => this.vm().state === 'empty');
  protected readonly errorMessage = computed(() => this.vm().errorMessage);
  protected readonly selectedIds = computed(() => this.vm().selectedIds);
  protected readonly pageSize = computed(() => this.vm().pagination.pageSize);

  /// TMDB is 1-based; MatPaginator is 0-based.
  protected readonly pageIndex = computed(() => this.vm().pagination.page - 1);

  /// Clamp displayed length to the pages TMDB will actually serve.
  protected readonly length = computed(() => {
    const { pageSize, totalItems, totalPages } = this.vm().pagination;

    return Math.min(totalItems, totalPages * pageSize);
  });

  protected readonly showToolbar = computed(
    () => this.length() > 0 && !this.isIdle() && this.errorMessage() === '',
  );

  protected readonly resultCountLabel = computed(() => {
    const count = this.length();
    const suffix = this.vm().pagination.totalItems > count ? '+' : '';
    const noun = count === 1 ? 'result' : 'results';

    return `${numberFormatter.format(count)}${suffix} ${noun}`;
  });

  protected onPage(event: PageEvent): void {
    this.pageSelected.emit(event.pageIndex + 1);
  }
}
