import { MovieSnapshot } from '@domain/movies';

export interface Collection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly movies: readonly MovieSnapshot[];
  readonly createdAt: number;
}

export function createCollection(
  id: string,
  title: string,
  description: string,
  createdAt: number,
): Collection {
  return {
    id,
    title: title.trim(),
    description: description.trim(),
    movies: [],
    createdAt,
  };
}

/// Adds only movies that are not already present.
export function addMovies(collection: Collection, movies: readonly MovieSnapshot[]): Collection {
  const existing = new Set(collection.movies.map((movie) => movie.id));
  const additions = movies.filter((movie) => !existing.has(movie.id));

  // Preserve reference identity for no-op mutations.
  if (additions.length === 0) {
    return collection;
  }

  return { ...collection, movies: [...collection.movies, ...additions] };
}

/// Removing the last movie keeps the collection, now empty.
export function removeMovie(collection: Collection, movieId: number): Collection {
  const remaining = collection.movies.filter((movie) => movie.id !== movieId);

  if (remaining.length === collection.movies.length) {
    return collection;
  }

  return { ...collection, movies: remaining };
}

export function updateDetails(
  collection: Collection,
  title: string,
  description: string,
): Collection {
  return { ...collection, title: title.trim(), description: description.trim() };
}

/// Validates persisted collections, including nested movie snapshots.
export function isCollectionArray(value: unknown): value is Collection[] {
  return Array.isArray(value) && value.every(isCollection);
}

function isCollection(value: unknown): value is Collection {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<Collection>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.createdAt === 'number' &&
    Array.isArray(candidate.movies) &&
    candidate.movies.every(isMovieSnapshot)
  );
}

function isMovieSnapshot(value: unknown): value is MovieSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<MovieSnapshot>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.voteAverage === 'number' &&
    (candidate.posterPath === null || typeof candidate.posterPath === 'string')
  );
}
