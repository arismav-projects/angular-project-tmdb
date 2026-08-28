import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

export interface RatingInputOptions {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly initialValue: number;
  readonly ariaLabel: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
}

const DEFAULT_OPTIONS: RatingInputOptions = {
  min: 1,
  max: 5,
  step: 1,
  initialValue: 3,
  ariaLabel: 'Rating',
  submitLabel: 'Submit rating',
  pendingLabel: 'Saving...',
};

@Component({
  selector: 'app-rating-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatSliderModule, MatButton],
  template: `
    @let config = options();

    <mat-slider
      class="rating-input__slider"
      [min]="config.min"
      [max]="config.max"
      [step]="config.step"
      discrete
    >
      <input matSliderThumb [formControl]="rating" [attr.aria-label]="config.ariaLabel" />
    </mat-slider>

    <button
      class="rating-input__submit"
      matButton="filled"
      type="button"
      [disabled]="pending()"
      (click)="onSubmit()"
    >
      <span class="rating-input__submit-label">
        <span [attr.aria-hidden]="pending()">{{ config.submitLabel }}</span>
        <span [attr.aria-hidden]="!pending()">{{ config.pendingLabel }}</span>
      </span>
    </button>

    <p class="rating-input__status" aria-live="polite">{{ status() }}</p>
  `,
  styleUrl: './rating-input.scss',
})
export class RatingInput {
  readonly options = input<RatingInputOptions>(DEFAULT_OPTIONS);
  readonly pending = input(false);
  readonly status = input('');
  readonly rate = output<number>();

  protected readonly rating = new FormControl(DEFAULT_OPTIONS.initialValue, { nonNullable: true });

  constructor() {
    effect(() => {
      this.rating.setValue(this.options().initialValue, { emitEvent: false });
    });
  }

  protected onSubmit(): void {
    this.rate.emit(this.rating.value);
  }
}
