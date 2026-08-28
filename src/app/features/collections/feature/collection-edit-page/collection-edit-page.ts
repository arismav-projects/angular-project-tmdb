import { CollectionsService } from '@domain/collections';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { CollectionForm, CollectionFormValue } from '../../ui/collection-form/collection-form';

@Component({
  selector: 'app-collection-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, CollectionForm, EmptyState],
  template: `
    @if (initial(); as value) {
      <app-page-header heading="Edit collection" backLabel="Back to collection" (back)="cancel()" />

      <app-collection-form
        [initial]="value"
        submitLabel="Save changes"
        (save)="save($event)"
        (dismiss)="cancel()"
      />
    } @else {
      <app-empty-state
        variant="error"
        heading="Collection not found"
        message="It may have been deleted, or the link may be out of date."
        actionLabel="Back to collections"
        (action)="backToList()"
      />
    }
  `,
  styleUrl: '../collection-page-layout.scss',
})
export class CollectionEditPage {
  readonly id = input.required<string>();

  private readonly collections = inject(CollectionsService);
  private readonly router = inject(Router);

  protected readonly initial = computed<CollectionFormValue | null>(() => {
    const collection = this.collections.find(this.id());

    return collection === null
      ? null
      : { title: collection.title, description: collection.description };
  });

  protected save(value: CollectionFormValue): void {
    this.collections.update(this.id(), value.title, value.description);
    void this.router.navigate(['/collections', this.id()]);
  }

  protected cancel(): void {
    void this.router.navigate(['/collections']);
  }

  protected backToList(): void {
    void this.router.navigate(['/collections']);
  }
}
