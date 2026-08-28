import { CollectionsService } from '@domain/collections';
import { MovieSnapshot } from '@domain/movies';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

export interface AddToCollectionData {
  readonly movies: readonly MovieSnapshot[];
}

@Component({
  selector: 'app-add-to-collection-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButton, MatCheckboxModule],
  templateUrl: './add-to-collection-dialog.html',
  styleUrl: './add-to-collection-dialog.scss',
})
export class AddToCollectionDialog {
  private readonly dialogRef = inject<MatDialogRef<AddToCollectionDialog>>(MatDialogRef);
  private readonly router = inject(Router);
  private readonly data = inject<AddToCollectionData>(MAT_DIALOG_DATA);

  private readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly store = inject(CollectionsService);
  protected readonly selectedCount = computed(() => this.selectedIds().size);

  protected readonly heading = computed(() => {
    const total = this.data.movies.length;
    return total === 1 ? 'Add 1 film to…' : `Add ${total} films to…`;
  });

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected onToggle(id: string, event: MatCheckboxChange): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);

      if (event.checked) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  protected confirm(): void {
    for (const id of this.selectedIds()) {
      // Deduplication stays in the collection model.
      this.store.addMovies(id, this.data.movies);
    }

    this.dialogRef.close();
  }

  protected createCollection(): void {
    // Close before navigating away from the dialog host.
    this.dialogRef.close();
    void this.router.navigate(['/collections/new']);
  }
}
