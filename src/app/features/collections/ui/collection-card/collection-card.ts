import type { Collection } from '@domain/collections';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatDivider, MatIconModule],
  templateUrl: './collection-card.html',
  styleUrl: './collection-card.scss',
})
export class CollectionCard {
  readonly collection = input.required<Collection>();

  readonly open = output<string>();

  protected readonly summary = computed(() => {
    const total = this.collection().movies.length;
    return total === 1 ? '1 film' : `${total} films`;
  });
}
