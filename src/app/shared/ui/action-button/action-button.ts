import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconModule],
  template: `
    <button [matButton]="appearance()" [type]="type()" (click)="action.emit()">
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

  /// Supports real form submission while keeping `button` as the safe default.
  readonly type = input<'button' | 'submit'>('button');

  readonly action = output<void>();
}
