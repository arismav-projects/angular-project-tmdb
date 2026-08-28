import { PageScrollService } from '@core/services/page-scroll.service';
import { NavMenu, NavMenuItem } from '@shared/ui/nav-menu/nav-menu';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { GlobalLoadingBar } from '../global-loading-bar/global-loading-bar';
import { OfflineBanner } from '../offline-banner/offline-banner';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

const NAV_LINKS: readonly NavMenuItem[] = [
  { path: '/search', label: 'Search', icon: 'search' },
  {
    path: '/collections',
    label: 'Collections',
    icon: 'video_library',
    children: [{ path: '/collections/new', label: 'New collection', icon: 'add' }],
  },
];

/// `em` keeps the drawer breakpoint aligned with the user's font size.
const DOCKED_DRAWER = '(min-width: 64em)';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterOutlet,
    NavMenu,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatIconButton,
    ThemeToggle,
    OfflineBanner,
    GlobalLoadingBar,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageScroll = inject(PageScrollService);

  protected readonly links = NAV_LINKS;

  /// Docked and floating drawers differ in behavior, not only layout.
  protected readonly isDocked = toSignal(
    inject(BreakpointObserver)
      .observe(DOCKED_DRAWER)
      .pipe(map((state) => state.matches)),
    { requireSync: true },
  );

  protected readonly drawer = viewChild(MatSidenav);

  private readonly content = viewChild(MatSidenavContent);
  private readonly scrollHost = {
    scrollTo: (options: ScrollToOptions): void => {
      void this.content()?.scrollTo(options);
    },
  };

  constructor() {
    this.pageScroll.register(this.scrollHost);
    this.destroyRef.onDestroy(() => this.pageScroll.unregister(this.scrollHost));

    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        // Close overlays after navigation on narrow screens.
        if (!this.isDocked()) {
          void this.drawer()?.close();
        }
      });
  }

  /// Fires only for page outlet changes, not routed dialogs nested inside a page.
  protected onPageChange(): void {
    this.pageScroll.scrollToTop();
  }
}
