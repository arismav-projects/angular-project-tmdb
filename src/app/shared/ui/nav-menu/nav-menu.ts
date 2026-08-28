import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

export interface NavMenuLink {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export interface NavMenuItem extends NavMenuLink {
  /// One nested level only; the template is not recursive.
  readonly children?: readonly NavMenuLink[];
}

interface Section {
  readonly item: NavMenuItem;
  readonly children: readonly NavMenuLink[];
  readonly isOpen: boolean;
  readonly toggleLabel: string;
}

/// Active-section matching ignores query string and fragment.
function pathOf(url: string): string {
  return url.split(/[?#]/)[0];
}

function contains(path: string, url: string): boolean {
  return url === path || url.startsWith(`${path}/`);
}

@Component({
  selector: 'app-nav-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.scss',
})
export class NavMenu {
  readonly items = input.required<readonly NavMenuItem[]>();

  private readonly router = inject(Router);

  /// Section state needs the current URL, not only individual active links.
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => pathOf(this.router.url)),
    ),
    { initialValue: pathOf(this.router.url) },
  );

  private readonly sectionInUrl = computed(() => {
    const url = this.url();

    return (
      this.items().find(
        (item) =>
          item.children !== undefined && item.children.length > 0 && contains(item.path, url),
      )?.path ?? null
    );
  });

  /// Keeps route-opened sections and user-opened sections together.
  private readonly openPaths = linkedSignal<string | null, ReadonlySet<string>>({
    source: this.sectionInUrl,
    computation: (section, previous) => {
      const open = new Set(previous?.value ?? []);

      if (section !== null) {
        open.add(section);
      }

      return open;
    },
  });

  protected readonly sections = computed<readonly Section[]>(() => {
    const open = this.openPaths();

    return this.items().map((item) => {
      const isOpen = open.has(item.path);

      return {
        item,
        children: item.children ?? [],
        isOpen,
        toggleLabel: `${isOpen ? 'Collapse' : 'Expand'} ${item.label}`,
      };
    });
  });

  protected toggle(path: string): void {
    this.openPaths.update((open) => {
      const next = new Set(open);

      if (!next.delete(path)) {
        next.add(path);
      }

      return next;
    });
  }
}
