import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Roles do sistema
export type UserRole = 'ENFERMAGEM' | 'MEDICO' | 'LIMPEZA' | 'NIR' | 'ACOMPANHANTE';

// Simula o serviço de autenticação (a ser integrado com backend real)
function getStoredRole(): UserRole | null {
  try {
    return (localStorage.getItem('userRole') as UserRole) ?? null;
  } catch {
    return null;
  }
}

/** Guard principal — verifica autenticação */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = getStoredRole();

  if (!role) {
    // TODO: redirecionar para login quando a tela for implementada
    // router.navigate(['/login']);
    return true; // Durante desenvolvimento, permite acesso livre
  }

  return true;
};

/** Guard de role — restringe acesso por perfil */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const role = getStoredRole();

    if (!role || !allowedRoles.includes(role)) {
      router.navigate(['/']);
      return false;
    }
    return true;
  };
};
