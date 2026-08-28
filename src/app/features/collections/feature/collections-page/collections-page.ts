import type { Collection } from '@domain/collections';
import { ActionButton } from '@shared/ui/action-button/action-button';
import { CollectionsService } from '@domain/collections';
import { ConfirmDialog, ConfirmDialogData } from '@shared/ui/confirm-dialog/confirm-dialog';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { CollectionCard } from '../../ui/collection-card/collection-card';

@Component({
  selector: 'app-collections-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, CollectionCard, EmptyState, ActionButton],
  templateUrl: './collections-page.html',
  styleUrl: './collections-page.scss',
})
export class CollectionsPage {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly collections = inject(CollectionsService);

  protected create(): void {
    void this.router.navigate(['/collections/new']);
  }

  protected open(id: string): void {
    void this.router.navigate(['/collections', id]);
  }

  protected edit(id: string): void {
    void this.router.navigate(['/collections', id, 'edit']);
  }

  /// Deletion is irreversible, so it asks first.
  protected requestDelete(collection: Collection): void {
    const data: ConfirmDialogData = {
      heading: `Delete ${collection.title}?`,
      message:
        collection.movies.length === 0
          ? 'This collection is empty. Deleting it cannot be undone.'
          : `This removes the collection and its ${collection.movies.length} film(s). It cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialog, { data, width: 'min(26rem, 92vw)', restoreFocus: true })
      .afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: unknown) => {
        if (confirmed === true) {
          this.collections.delete(collection.id);
        }
      });
  }
}
