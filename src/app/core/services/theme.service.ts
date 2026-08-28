import { effect, inject, Injectable, signal } from '@angular/core';
import { LOCAL_STORAGE_KEYS } from '@core/storage/local-storage.keys';

import { StorageService } from './storage.service';

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/// Keeps the active theme in storage and on the document root.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  private readonly _isDark = signal(
    this.storage.read(LOCAL_STORAGE_KEYS.themePreference, isBoolean) ??
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  readonly isDark = this._isDark.asReadonly();

  constructor() {
    // External side effects: DOM attribute and localStorage.
    effect(() => {
      document.documentElement.setAttribute('data-theme', this._isDark() ? 'dark' : 'light');
      this.storage.write(LOCAL_STORAGE_KEYS.themePreference, this._isDark());
    });
  }

  toggle(): void {
    this._isDark.update((dark) => !dark);
  }
}
