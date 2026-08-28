import { Injectable } from '@angular/core';

/// localStorage access with shape validation and guarded browser calls.
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = resolveStorage();

  read<T>(key: string, isValid: (value: unknown) => value is T): T | null {
    if (!this.storage) {
      return null;
    }

    let raw: string | null;
    try {
      raw = this.storage.getItem(key);
    } catch {
      return null;
    }

    if (raw === null) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.remove(key);
      return null;
    }

    if (!isValid(parsed)) {
      this.remove(key);
      return null;
    }

    return parsed;
  }

  /// Returns false when the browser rejects the write.
  write(key: string, value: unknown): boolean {
    if (!this.storage) {
      return false;
    }

    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      this.storage?.removeItem(key);
    } catch {
      // Best-effort cleanup.
    }
  }
}

/// Checks that localStorage exists and accepts writes.
function resolveStorage(): Storage | null {
  try {
    const probeKey = '__storage_probe__';
    localStorage.setItem(probeKey, probeKey);
    localStorage.removeItem(probeKey);
    return localStorage;
  } catch {
    return null;
  }
}
