import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

/**
 * Factory para criar guard de role
 * Uso: canActivate: [roleGuard([UserRole.ADMIN, UserRole.MEDICO])]
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Redireciona para a página apropriada baseada no role
    return router.createUrlTree(['/unauthorized']);
  };
}
