import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconButton, MatIconModule],
  template: `
    @if (backLabel()) {
      <button matIconButton type="button" [attr.aria-label]="backLabel()" (click)="back.emit()">
        <mat-icon>arrow_back</mat-icon>
      </button>
    }

    <h1 class="page-header__heading">{{ heading() }}</h1>

    <div class="page-header__actions">
      <ng-content select="[actions]" />
    </div>
  `,
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly backLabel = input('');

  readonly back = output<void>();
}
