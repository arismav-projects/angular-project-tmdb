import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'card' | 'list';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
  host: {
    '[class]': '"skeleton skeleton--" + variant()',
  },
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('card');
  readonly count = input(1);

  protected readonly placeholders = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_unused, index) => index),
  );
}
