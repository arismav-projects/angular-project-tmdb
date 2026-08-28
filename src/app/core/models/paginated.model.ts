/// Shared shape for paged API responses.
export interface Paginated<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly totalPages: number;
  readonly totalItems: number;
}

export function emptyPage<T>(): Paginated<T> {
  return { items: [], page: 1, totalPages: 0, totalItems: 0 };
}
