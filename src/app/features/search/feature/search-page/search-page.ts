import { TMDB_CONFIG } from '@core/config/tmdb.config';
import { appErrorMessage } from '@core/models/app-error';
import { PageScrollService } from '@core/services/page-scroll.service';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { SearchField } from '@shared/ui/search-field/search-field';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { take } from 'rxjs';

import { SearchFacade } from '../../data-access/search.facade';
import {
  type MovieSelection,
  SearchResults,
  type SearchResultsVm,
} from '../../ui/search-results/search-results';
import { SelectionBar } from '../../ui/selection-bar/selection-bar';
import { AddToCollectionDialog } from '../add-to-collection-dialog/add-to-collection-dialog';

@Component({
  selector: 'app-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, SearchField, SearchResults, SelectionBar, RouterOutlet],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageScroll = inject(PageScrollService);

  protected readonly search = inject(SearchFacade);
  protected readonly pageSize = inject(TMDB_CONFIG).pageSize;

  protected readonly errorMessage = computed(() => {
    const error = this.search.error();
    return error === null ? '' : appErrorMessage(error);
  });

  protected readonly resultsVm = computed<SearchResultsVm>(() => {
    const results = this.search.results();

    return {
      movies: results.items,
      status: this.search.status(),
      errorMessage: this.errorMessage(),
      selectedIds: this.search.selectedIds(),
      pagination: {
        page: this.search.page(),
        totalPages: results.totalPages,
        totalItems: results.totalItems,
        pageSize: this.pageSize,
      },
    };
  });

  protected openDetails(id: number): void {
    // Relative navigation keeps results mounted behind the dialog.
    void this.router.navigate(['movie', id], { relativeTo: this.route });
  }

  protected onSelection(change: MovieSelection): void {
    this.search.toggleSelection(change.movie, change.isSelected);
  }

  protected onPageSelected(page: number): void {
    this.search.setPage(page);
    this.pageScroll.scrollToTop();
  }

  protected addSelectedToCollection(): void {
    this.dialog
      .open(AddToCollectionDialog, {
        data: { movies: this.search.selection() },
        width: 'min(28rem, 92vw)',
        restoreFocus: true,
      })
      .afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Selection is cleared after either confirmation or dismissal.
        // this.search.clearSelection();
      });
  }
}
