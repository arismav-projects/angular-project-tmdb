import type { Collection } from '@domain/collections';
import { PosterImage } from '@shared/ui/poster-image/poster-image';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, PosterImage],
  templateUrl: './collection-card.html',
  styleUrl: './collection-card.scss',
})
export class CollectionCard {
  readonly collection = input.required<Collection>();

  readonly open = output<string>();

  protected readonly previewMovies = computed(() => this.collection().movies.slice(0, 3));

  protected readonly summary = computed(() => {
    const total = this.collection().movies.length;
    return total === 1 ? '1 film' : `${total} films`;
  });
}
