import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ActionButtonTone = 'primary' | 'secondary' | 'error';

@Component({
  selector: 'app-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconModule],
  template: `
    <button
      class="action-button"
      [class.action-button--secondary]="tone() === 'secondary'"
      [class.action-button--error]="tone() === 'error'"
      [matButton]="appearance()"
      [type]="type()"
      (click)="action.emit()"
    >
      <mat-icon>{{ icon() }}</mat-icon>
      {{ label() }}
    </button>
  `,
  styleUrl: './action-button.scss',
})
export class ActionButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly appearance = input<MatButtonAppearance>('text');
  readonly tone = input<ActionButtonTone>('primary');

  /// Supports real form submission while keeping `button` as the safe default.
  readonly type = input<'button' | 'submit'>('button');

  readonly action = output<void>();
}
