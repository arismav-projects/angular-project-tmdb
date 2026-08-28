import { NotificationService } from '@core/services/notification.service';
import { StorageService } from '@core/services/storage.service';
import { LOCAL_STORAGE_KEYS } from '@core/storage/local-storage.keys';
import { computed, inject, Injectable, signal } from '@angular/core';
import { MovieSnapshot } from '@domain/movies';

import {
  addMovies,
  Collection,
  createCollection,
  isCollectionArray,
  removeMovie,
  updateDetails,
} from './collection.model';

/// Shared collection state with localStorage persistence.
@Injectable({ providedIn: 'root' })
export class CollectionsService {
  private readonly storage = inject(StorageService);
  private readonly notifications = inject(NotificationService);

  private readonly _collections = signal<readonly Collection[]>(
    this.storage.read(LOCAL_STORAGE_KEYS.collections, isCollectionArray) ?? [],
  );

  readonly collections = this._collections.asReadonly();
  readonly count = computed(() => this._collections().length);
  readonly isEmpty = computed(() => this._collections().length === 0);

  /// Signal read is intentional; computed callers track collection changes.
  find(id: string): Collection | null {
    return this._collections().find((collection) => collection.id === id) ?? null;
  }

  /// Returns the new id for immediate navigation.
  create(title: string, description: string): string {
    const collection = createCollection(newId(), title, description, Date.now());

    this.commit([...this._collections(), collection]);

    return collection.id;
  }

  update(id: string, title: string, description: string): void {
    this.replace(id, (collection) => updateDetails(collection, title, description));
  }

  delete(id: string): void {
    this.commit(this._collections().filter((collection) => collection.id !== id));
  }

  addMovies(id: string, movies: readonly MovieSnapshot[]): void {
    this.replace(id, (collection) => addMovies(collection, movies));
  }

  removeMovie(id: string, movieId: number): void {
    this.replace(id, (collection) => removeMovie(collection, movieId));
  }

  private replace(id: string, change: (collection: Collection) => Collection): void {
    const current = this._collections();
    const existing = current.find((collection) => collection.id === id);

    if (existing === undefined) {
      return;
    }

    const updated = change(existing);

    // Domain helpers return the same reference for no-op mutations.
    if (updated === existing) {
      return;
    }

    this.commit(current.map((collection) => (collection === existing ? updated : collection)));
  }

  private commit(collections: readonly Collection[]): void {
    this._collections.set(collections);

    if (!this.storage.write(LOCAL_STORAGE_KEYS.collections, collections)) {
      this.notifications.error('Your collections could not be saved to this browser.');
    }
  }
}

/// `randomUUID` can be unavailable on non-secure contexts such as LAN dev URLs.
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `collection-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
