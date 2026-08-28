import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

import { PosterImage } from '../poster-image/poster-image';
import { VoteBadge } from '../vote-badge/vote-badge';
import { DatePipe } from '@angular/common';

export interface MovieCardData {
  readonly id: number;
  readonly title: string;
  readonly posterPath: string | null;
  readonly voteAverage: number;
  readonly releaseDate?: string | null;
}

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCheckboxModule, PosterImage, VoteBadge, DatePipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
  host: {
    // Host class lets selected styles reach the card frame.
    '[class.movie-card--selected]': 'selected()',
  },
})
export class MovieCard {
  readonly movie = input.required<MovieCardData>();
  readonly selectable = input(false);
  readonly selected = model(false);
  readonly priority = input(false);

  readonly open = output<number>();

  protected readonly selectLabel = computed(() => `Select ${this.movie().title}`);

  protected onSelectionChange(event: MatCheckboxChange): void {
    this.selected.set(event.checked);
  }
}
