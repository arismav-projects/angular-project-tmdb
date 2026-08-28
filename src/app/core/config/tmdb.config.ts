import { InjectionToken } from '@angular/core';

export interface TmdbConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly imageBaseUrl: string;
  readonly pageSize: number;
}

export const TMDB_CONFIG = new InjectionToken<TmdbConfig>('TMDB_CONFIG');
