import { Injectable } from '@angular/core';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface PageScrollHost {
  scrollTo(options: ScrollToOptions): void | Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PageScrollService {
  private host: PageScrollHost | null = null;

  register(host: PageScrollHost): void {
    this.host = host;
  }

  unregister(host: PageScrollHost): void {
    if (this.host === host) {
      this.host = null;
    }
  }

  scrollToTop(): void {
    void this.host?.scrollTo({
      top: 0,
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches
    );
  }
}
