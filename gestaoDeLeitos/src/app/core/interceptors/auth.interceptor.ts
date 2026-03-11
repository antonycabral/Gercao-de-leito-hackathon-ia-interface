import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

/** Interceptor que adiciona Authorization header em todas as requisições à API */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Aplica apenas para chamadas à API interna
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const token = localStorage.getItem('authToken') ?? '';

  const authReq = req.clone({
    setHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0'
    }
  });

  return next(authReq);
};
