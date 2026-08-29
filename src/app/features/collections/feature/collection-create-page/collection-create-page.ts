import { CollectionsService } from '@domain/collections';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CollectionForm, CollectionFormValue } from '../../ui/collection-form/collection-form';

@Component({
  selector: 'app-collection-create-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, CollectionForm],
  template: `
    <app-page-header
      heading="New collection"
      icon="create_new_folder"
      backLabel="Back to collections"
      (back)="cancel()"
    />

    <app-collection-form
      submitLabel="Create"
      submitIcon="add"
      (save)="save($event)"
      (dismiss)="cancel()"
    />
  `,
  styleUrl: '../collection-page-layout.scss',
})
export class CollectionCreatePage {
  private readonly collections = inject(CollectionsService);
  private readonly router = inject(Router);

  protected save(value: CollectionFormValue): void {
    const id = this.collections.create(value.title, value.description);

    // Newly created collections open immediately.
    void this.router.navigate(['/collections', id]);
  }

  protected cancel(): void {
    void this.router.navigate(['/collections']);
  }
}
