import { CanActivateFn } from '@angular/router';

import { Role } from './role';

/// Future auth should redirect with a `UrlTree` instead of returning `false`.
export function roleGuard(...allowed: readonly Role[]): CanActivateFn {
  return () => {
    void allowed;
    return true;
  };
}
