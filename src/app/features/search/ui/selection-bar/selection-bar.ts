import { ActionButton } from '@shared/ui/action-button/action-button';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-selection-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionButton],
  template: `
    <p class="selection-bar__count">{{ summary() }}</p>

    <app-action-button icon="clear" label="Clear" (action)="clear.emit()" />

    <app-action-button
      appearance="filled"
      icon="playlist_add"
      label="Add to collection"
      (action)="add.emit()"
    />
  `,
  styleUrl: './selection-bar.scss',
})
export class SelectionBar {
  readonly count = input.required<number>();

  readonly add = output<void>();
  readonly clear = output<void>();

  protected readonly summary = computed(() =>
    this.count() === 1 ? '1 film selected' : `${this.count()} films selected`,
  );
}
