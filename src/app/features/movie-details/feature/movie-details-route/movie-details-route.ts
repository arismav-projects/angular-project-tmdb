import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { MovieDetailsFacade } from '../../data-access/movie-details.facade';
import { MovieDetailsDialogContent } from '../movie-details-dialog-content/movie-details-dialog-content';

/// Routed dialog used by both direct URLs and in-app clicks.
@Component({
  selector: 'app-movie-details-route',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class MovieDetailsRoute {
  /// Bound from the URL by `withComponentInputBinding()`.
  readonly id = input.required<string>();

  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(MovieDetailsFacade);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private dialogRef: MatDialogRef<MovieDetailsDialogContent> | null = null;

  /// Prevents teardown-triggered dialog closes from navigating again.
  private isTearingDown = false;

  constructor() {
    effect(() => {
      const movieId = Number(this.id());

      // Reject invalid hand-edited ids before hitting TMDB.
      if (!Number.isInteger(movieId) || movieId <= 0) {
        this.leave();
        return;
      }

      this.facade.load(movieId);
      this.openDialog();
    });

    this.destroyRef.onDestroy(() => {
      this.isTearingDown = true;
      this.dialogRef?.close();
    });
  }

  private openDialog(): void {
    // Reuse the dialog while the route id changes.
    if (this.dialogRef !== null) {
      return;
    }

    this.dialogRef = this.dialog.open(MovieDetailsDialogContent, {
      // Share this route's facade instance with the dialog body.
      injector: this.injector,
      width: 'min(46rem, 92vw)',
      maxHeight: '90dvh',
      autoFocus: 'dialog',
      restoreFocus: true,
    });

    this.dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isTearingDown) {
          return;
        }
        this.leave();
      });
  }

  private leave(): void {
    const host = this.route.parent?.parent ?? null;
    const segments = host === null ? [] : host.pathFromRoot.flatMap((route) => route.snapshot.url);

    void this.router.navigate(['/', ...segments.map((segment) => segment.path)], {
      replaceUrl: true,
    });
  }
}
