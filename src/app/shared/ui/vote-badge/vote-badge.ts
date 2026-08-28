import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/// TMDB reports `0` when a film has no rating.
@Component({
  selector: 'app-vote-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <mat-icon class="vote-badge__icon">star</mat-icon>
    <span>{{ display() }}</span>
  `,
  styleUrl: './vote-badge.scss',
  host: {
    '[class.vote-badge--unrated]': '!isRated()',
  },
})
export class VoteBadge {
  readonly value = input.required<number>();

  protected readonly isRated = computed(() => this.value() > 0);

  protected readonly display = computed(() => (this.isRated() ? this.value().toFixed(1) : 'NR'));
}
