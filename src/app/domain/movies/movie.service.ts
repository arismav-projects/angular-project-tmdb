import { TMDB_CONFIG } from '@core/config/tmdb.config';
import { Paginated } from '@core/models/paginated.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GuestSession, Movie, MovieDetails } from './movie.model';

interface MovieSummaryDto {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

interface MovieDetailsDto extends MovieSummaryDto {
  budget: number;
  revenue: number;
  spoken_languages: { iso_639_1: string; english_name: string; name: string }[];
}

interface PagedResponseDto<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface GuestSessionDto {
  guest_session_id: string;
  /// TMDB returns "YYYY-MM-DD HH:mm:ss UTC", not ISO 8601.
  expires_at: string;
}

/// TMDB rejects pages above 500 even when `total_pages` is higher.
const TMDB_MAX_PAGE = 500;

/// Refresh early when a guest session expiry cannot be parsed.
const GUEST_SESSION_FALLBACK_MS = 23 * 60 * 60 * 1000;

export function toMovie(dto: MovieSummaryDto): Movie {
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    posterPath: dto.poster_path,
    // TMDB uses an empty string when the release date is unknown.
    releaseDate: dto.release_date === '' ? null : dto.release_date,
    voteAverage: dto.vote_average,
    voteCount: dto.vote_count,
  };
}

export function toMovieDetails(dto: MovieDetailsDto): MovieDetails {
  return {
    ...toMovie(dto),
    budget: dto.budget,
    revenue: dto.revenue,
    // `name` is localized; the UI needs the English label.
    spokenLanguages: dto.spoken_languages.map((language) => language.english_name),
  };
}

/// Normalizes TMDB's non-ISO UTC timestamp before parsing it.
export function parseTmdbTimestamp(raw: string, now: number): number {
  const parsed = Date.parse(raw.replace(' ', 'T').replace(' UTC', 'Z'));

  return Number.isNaN(parsed) ? now + GUEST_SESSION_FALLBACK_MS : parsed;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TMDB_CONFIG);

  search(query: string, page: number): Observable<Paginated<Movie>> {
    return this.http
      .get<PagedResponseDto<MovieSummaryDto>>(this.url('search/movie'), {
        params: new HttpParams().set('query', query).set('page', page),
      })
      .pipe(
        map((response) => ({
          items: response.results.map(toMovie),
          page: response.page,
          totalPages: Math.min(response.total_pages, TMDB_MAX_PAGE),
          totalItems: response.total_results,
        })),
      );
  }

  getDetails(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetailsDto>(this.url(`movie/${id}`)).pipe(map(toMovieDetails));
  }

  createGuestSession(): Observable<GuestSession> {
    return this.http.get<GuestSessionDto>(this.url('authentication/guest_session/new')).pipe(
      map((response) => ({
        id: response.guest_session_id,
        expiresAt: parseTmdbTimestamp(response.expires_at, Date.now()),
      })),
    );
  }

  rate(movieId: number, value: number, guestSessionId: string): Observable<void> {
    // Guest ratings require a query parameter.
    return this.http
      .post<unknown>(
        this.url(`movie/${movieId}/rating`),
        { value },
        { params: new HttpParams().set('guest_session_id', guestSessionId) },
      )
      .pipe(map(() => undefined));
  }

  private url(path: string): string {
    return `${this.config.baseUrl}/${path}`;
  }
}
