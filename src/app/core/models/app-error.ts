export type AppError =
  | { readonly kind: 'network' }
  | { readonly kind: 'notFound' }
  | { readonly kind: 'rateLimited' }
  | { readonly kind: 'unauthorized' }
  | { readonly kind: 'client'; readonly status: number }
  | { readonly kind: 'server'; readonly status: number }
  | { readonly kind: 'unknown' };

export function isAppError(value: unknown): value is AppError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { kind?: unknown; status?: unknown };

  switch (candidate.kind) {
    case 'network':
    case 'notFound':
    case 'rateLimited':
    case 'unauthorized':
    case 'unknown':
      return true;
    case 'client':
    case 'server':
      return typeof candidate.status === 'number';
    default:
      return false;
  }
}

export function appErrorMessage(error: AppError): string {
  switch (error.kind) {
    case 'network':
      return 'No connection. Check your network and try again.';
    case 'notFound':
      return 'We could not find that. It may have been removed.';
    case 'rateLimited':
      return 'Too many requests. Wait a moment and try again.';
    case 'unauthorized':
      return 'The API key was rejected. Check the TMDB configuration.';
    case 'client':
      return 'That request could not be completed.';
    case 'server':
      return 'TMDB is having trouble right now. Try again shortly.';
    case 'unknown':
      return 'Something went wrong.';
  }
}
