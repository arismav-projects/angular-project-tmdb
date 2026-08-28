import { effect, inject, Injectable, signal } from '@angular/core';

import { StorageService } from './storage.service';

const STORAGE_KEY = 'theme-preference';

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/// Keeps the active theme in storage and on the document root.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  private readonly _isDark = signal(
    this.storage.read(STORAGE_KEY, isBoolean) ??
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  readonly isDark = this._isDark.asReadonly();

  constructor() {
    // External side effects: DOM attribute and localStorage.
    effect(() => {
      document.documentElement.setAttribute('data-theme', this._isDark() ? 'dark' : 'light');
      this.storage.write(STORAGE_KEY, this._isDark());
    });
  }

  toggle(): void {
    this._isDark.update((dark) => !dark);
  }
}
