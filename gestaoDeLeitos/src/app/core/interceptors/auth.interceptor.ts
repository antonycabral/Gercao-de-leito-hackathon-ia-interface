import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor para adicionar token de autenticação nas requisições
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se não há token ou é uma requisição de auth, não adiciona o header
  if (!token || req.url.includes('/auth/')) {
    return next(req);
  }

  // Clona a requisição e adiciona o header de autorização
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(authReq);
};
