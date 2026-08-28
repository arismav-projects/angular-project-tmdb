import { computed, Injectable, signal } from '@angular/core';

/// Tracks active HTTP requests for the global loading UI.
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);

  readonly isLoading = computed(() => this.pending() > 0);

  start(): void {
    this.pending.update((count) => count + 1);
  }

  stop(): void {
    // Guard against duplicate stop calls from retries or cancellations.
    this.pending.update((count) => Math.max(0, count - 1));
  }
}
