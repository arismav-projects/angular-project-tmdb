import { Directive, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/// Reusable search-term validation. Empty values remain valid; required is caller-owned.
@Directive({
  selector: '[appSearchValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: SearchValidatorDirective, multi: true }],
})
export class SearchValidatorDirective implements Validator {
  readonly minChars = input(3);
  readonly allowedPattern = input<RegExp>(/^[a-z0-9 ]+$/i);

  validate(control: AbstractControl): ValidationErrors | null {
    const raw: unknown = control.value;
    const value = typeof raw === 'string' ? raw.trim() : '';

    if (value === '') {
      return null;
    }

    if (!this.allowedPattern().test(value)) {
      return { searchPattern: true, message: 'Use letters, numbers and spaces only.' };
    }

    if (value.length < this.minChars()) {
      return {
        searchMinLength: { requiredLength: this.minChars(), actualLength: value.length },
        message: `Enter at least ${this.minChars()} characters.`,
      };
    }

    return null;
  }
}
