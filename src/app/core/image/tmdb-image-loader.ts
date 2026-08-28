import { IMAGE_LOADER, ImageLoader } from '@angular/common';
import { inject, Provider } from '@angular/core';

import { TMDB_CONFIG } from '../config/tmdb.config';

/// TMDB poster width buckets used by the Angular image loader.
const POSTER_WIDTHS = [92, 154, 185, 342, 500, 780] as const;

export function posterBucket(width: number | undefined): string {
  if (width === undefined) {
    return 'w342';
  }

  const bucket = POSTER_WIDTHS.find((candidate) => candidate >= width);

  return bucket === undefined ? 'original' : `w${bucket}`;
}

export function provideTmdbImageLoader(): Provider {
  return {
    provide: IMAGE_LOADER,
    useFactory: (): ImageLoader => {
      const config = inject(TMDB_CONFIG);

      return ({ src, width }) => {
        // Normalize the leading slash; doubled slashes 404 on TMDB.
        const path = src.startsWith('/') ? src : `/${src}`;

        return `${config.imageBaseUrl}/${posterBucket(width)}${path}`;
      };
    },
  };
}
