import { appErrorMessage } from '@core/models/app-error';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { Skeleton } from '@shared/ui/skeleton/skeleton';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { MovieDetailsFacade } from '../../data-access/movie-details.facade';
import { MovieDetailsView } from '../../ui/movie-details-view/movie-details-view';

/// Dialog body using the route-provided `MovieDetailsFacade`.
@Component({
  selector: 'app-movie-details-dialog-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButton, Skeleton, EmptyState, MovieDetailsView],
  templateUrl: './movie-details-dialog-content.html',
  styleUrl: './movie-details-dialog-content.scss',
})
export class MovieDetailsDialogContent {
  protected readonly facade = inject(MovieDetailsFacade);

  /// Gives the dialog an accessible name before the film loads.
  protected readonly title = computed(() => this.facade.movie()?.title ?? 'Film details');

  protected readonly errorMessage = computed(() => {
    const error = this.facade.error();
    return error === null ? '' : appErrorMessage(error);
  });
}
