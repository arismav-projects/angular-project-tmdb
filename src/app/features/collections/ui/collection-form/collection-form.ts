import { ActionButton } from '@shared/ui/action-button/action-button';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CollectionFormValue {
  readonly title: string;
  readonly description: string;
}

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 280;

/// `Validators.required` accepts whitespace-only strings.
function nonBlank(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;

  return typeof value === 'string' && value.trim().length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-collection-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, ActionButton],
  templateUrl: './collection-form.html',
  styleUrl: './collection-form.scss',
})
export class CollectionForm {
  readonly initial = input<CollectionFormValue | null>(null);
  readonly submitLabel = input('Save');

  /// Keeps the action icon aligned with the caller's submit label.
  readonly submitIcon = input('save');

  readonly save = output<CollectionFormValue>();

  /// Avoids the native `cancel` event name.
  readonly dismiss = output<void>();

  protected readonly titleMax = TITLE_MAX;
  protected readonly descriptionMax = DESCRIPTION_MAX;

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank, Validators.maxLength(TITLE_MAX)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(DESCRIPTION_MAX)],
    }),
  });

  constructor() {
    // Sync the input value into the reactive form.
    effect(() => {
      const value = this.initial();

      if (value === null) {
        return;
      }

      this.form.setValue({ title: value.title, description: value.description });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      // Show Material errors after an invalid submit.
      this.form.markAllAsTouched();
      return;
    }

    const { title, description } = this.form.getRawValue();

    this.save.emit({ title: title.trim(), description: description.trim() });
  }
}
