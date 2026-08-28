import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type EmptyStateVariant = 'empty' | 'error' | 'offline';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButton],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  host: {
    '[class]': '"empty-state empty-state--" + variant()',
  },
})
export class EmptyState {
  readonly variant = input<EmptyStateVariant>('empty');
  /// Avoids the native `title` tooltip attribute.
  readonly heading = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input('');

  readonly action = output<void>();

  protected readonly icon = computed(() => {
    switch (this.variant()) {
      case 'error':
        return 'error_outline';
      case 'offline':
        return 'cloud_off';
      case 'empty':
        return 'search_off';
    }
  });
}
