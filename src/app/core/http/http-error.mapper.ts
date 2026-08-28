import { HttpErrorResponse } from '@angular/common/http';
import { AppError, isAppError } from '../models/app-error';

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'unknown' };
  }

  // Status 0 means the request did not reach the server.
  if (error.status === 0) {
    return { kind: 'network' };
  }

  switch (error.status) {
    case 401:
    case 403:
      return { kind: 'unauthorized' };
    case 404:
      return { kind: 'notFound' };
    case 429:
      return { kind: 'rateLimited' };
    default:
      return error.status >= 500
        ? { kind: 'server', status: error.status }
        : { kind: 'client', status: error.status };
  }
}
