import type { MovieDetails } from '@domain/movies';
import { PosterImage } from '@shared/ui/poster-image/poster-image';
import { RatingInput, type RatingInputOptions } from '@shared/ui/rating-input/rating-input';
import { VoteBadge } from '@shared/ui/vote-badge/vote-badge';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

const TMDB_RATING_OPTIONS: RatingInputOptions = {
  min: 0.5,
  max: 10,
  step: 0.5,
  initialValue: 7.5,
  ariaLabel: 'Your rating out of 10',
  submitLabel: 'Submit rating',
  pendingLabel: 'Saving...',
};

@Component({
  selector: 'app-movie-details-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatChipsModule, PosterImage, VoteBadge, RatingInput],
  templateUrl: './movie-details-view.html',
  styleUrl: './movie-details-view.scss',
})
export class MovieDetailsView {
  readonly movie = input.required<MovieDetails>();
  readonly ratingPending = input(false);
  readonly submittedRating = input<number | null>(null);

  readonly rate = output<number>();

  protected readonly ratingOptions = TMDB_RATING_OPTIONS;
  protected readonly hasOverview = computed(() => this.movie().overview.trim().length > 0);
  protected readonly hasBudget = computed(() => this.movie().budget > 0);
  protected readonly hasRevenue = computed(() => this.movie().revenue > 0);
  protected readonly hasLanguages = computed(() => this.movie().spokenLanguages.length > 0);

  protected readonly ratingStatus = computed(() => {
    const value = this.submittedRating();
    return value === null ? '' : `Your rating of ${value} was saved.`;
  });

  protected readonly voteSummary = computed(() => {
    const count = this.movie().voteCount;

    if (count === 0) {
      return 'No votes yet';
    }

    return count === 1 ? 'from 1 vote' : `from ${count.toLocaleString()} votes`;
  });
}
