import { ActionButton } from '@shared/ui/action-button/action-button';
import { CollectionsService } from '@domain/collections';
import type { MovieSnapshot } from '@domain/movies';
import { ConfirmDialog, ConfirmDialogData } from '@shared/ui/confirm-dialog/confirm-dialog';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { MovieCard } from '@shared/ui/movie-card/movie-card';
import { PageHeader } from '@shared/ui/page-header/page-header';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-collection-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, MovieCard, EmptyState, RouterOutlet, ActionButton],
  templateUrl: './collection-detail-page.html',
  styleUrl: './collection-detail-page.scss',
})
export class CollectionDetailPage {
  readonly id = input.required<string>();

  private readonly collections = inject(CollectionsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly collection = computed(() => this.collections.find(this.id()));

  protected back(): void {
    void this.router.navigate(['/collections']);
  }

  protected edit(): void {
    void this.router.navigate(['/collections', this.id(), 'edit']);
  }

  protected goToSearch(): void {
    void this.router.navigate(['/search']);
  }

  protected openMovie(movieId: number): void {
    // Relative navigation keeps the collection mounted behind the dialog.
    void this.router.navigate(['movie', movieId], { relativeTo: this.route });
  }

  protected requestRemove(movie: MovieSnapshot): void {
    const data: ConfirmDialogData = {
      heading: `Remove ${movie.title}?`,
      message: 'The film stays available in search; it is only removed from this collection.',
      confirmLabel: 'Remove',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialog, { data, width: 'min(26rem, 92vw)', restoreFocus: true })
      .afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: unknown) => {
        if (confirmed === true) {
          this.collections.removeMovie(this.id(), movie.id);
        }
      });
  }
}
