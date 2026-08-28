export interface Movie {
  readonly id: number;
  readonly title: string;
  readonly overview: string;
  readonly posterPath: string | null;
  /// Null when TMDB sends its empty-string "unknown date" sentinel.
  readonly releaseDate: string | null;
  readonly voteAverage: number;
  readonly voteCount: number;
}

export interface MovieDetails extends Movie {
  /// TMDB uses 0 for "unknown"; the UI treats it as absent.
  readonly budget: number;
  readonly revenue: number;
  readonly spokenLanguages: readonly string[];
}

/// Stored copy used by collections so they can render without a fetch.
export interface MovieSnapshot {
  readonly id: number;
  readonly title: string;
  readonly posterPath: string | null;
  readonly voteAverage: number;
}

export function toSnapshot(movie: Movie): MovieSnapshot {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    voteAverage: movie.voteAverage,
  };
}

/// Anonymous TMDB session used for guest ratings.
export interface GuestSession {
  readonly id: string;
  readonly expiresAt: number;
}

export function isGuestSessionValid(session: GuestSession, now: number): boolean {
  return session.expiresAt > now;
}

/// TMDB accepts half-point ratings from 0.5 to 10.
export const RATING_MIN = 0.5;
export const RATING_MAX = 10;
export const RATING_STEP = 0.5;

export function isValidRating(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= RATING_MIN &&
    value <= RATING_MAX &&
    // Allow tiny drift from slider/math operations before checking the half-point step.
    Math.abs(value / RATING_STEP - Math.round(value / RATING_STEP)) < 1e-9
  );
}
