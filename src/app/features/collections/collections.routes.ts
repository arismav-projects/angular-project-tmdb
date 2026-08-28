import { Routes } from '@angular/router';

/// Child routes host movie details over collection pages.
export function collectionsRoutes(children: Routes = []): Routes {
  return [
    {
      path: '',
      loadComponent: () =>
        import('./feature/collections-page/collections-page').then((m) => m.CollectionsPage),
      title: 'Your collections',
    },
    {
      path: 'new',
      loadComponent: () =>
        import('./feature/collection-create-page/collection-create-page').then(
          (m) => m.CollectionCreatePage,
        ),
      title: 'New collection',
    },
    {
      path: ':id/edit',
      loadComponent: () =>
        import('./feature/collection-edit-page/collection-edit-page').then(
          (m) => m.CollectionEditPage,
        ),
      title: 'Edit collection',
    },
    {
      path: ':id',
      loadComponent: () =>
        import('./feature/collection-detail-page/collection-detail-page').then(
          (m) => m.CollectionDetailPage,
        ),
      title: 'Collection',
      children: [{ path: '', children: [] }, ...children],
    },
  ];
}
