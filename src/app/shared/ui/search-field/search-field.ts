import { SearchValidatorDirective } from '@shared/directives/search-validator.directive';
import { ChangeDetectionStrategy, Component, input, output, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounce, distinctUntilChanged, filter, map, timer } from 'rxjs';

/// Shows errors once the current field is dirty or touched.
class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null): boolean {
    return control !== null && control.invalid && (control.dirty || control.touched);
  }
}

@Component({
  selector: 'app-search-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher }],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatIconButton,
    SearchValidatorDirective,
  ],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
})
export class SearchField implements OnInit {
  readonly label = input('Search');
  readonly minChars = input(3);
  readonly debounceMs = input(500);
  readonly initialQuery = input('');
  readonly queryChange = output<string>();
  protected readonly control = new FormControl('', { nonNullable: true });

  protected readonly hasValue = toSignal(
    this.control.valueChanges.pipe(map((term) => term.length > 0)),
    { initialValue: false },
  );

  protected readonly errorMessage = toSignal(
    this.control.valueChanges.pipe(
      map((): string | null => {
        const message: unknown = this.control.errors?.['message'];

        return typeof message === 'string' ? message : null;
      }),
    ),
    { initialValue: null },
  );

  constructor() {
    this.control.valueChanges
      .pipe(
        debounce(() => timer(this.debounceMs())),
        map((term) => term.trim()),
        distinctUntilChanged(),
        filter((term) => term === '' || this.control.valid),
        takeUntilDestroyed(),
      )
      .subscribe((term) => {
        this.queryChange.emit(term);
      });
  }

  ngOnInit(): void {
    const seed = this.initialQuery();

    if (seed !== '') {
      this.control.setValue(seed);
    }
  }

  protected clear(): void {
    this.control.setValue('');
  }
}
