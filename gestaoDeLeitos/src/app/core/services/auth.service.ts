import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthCredentials, AuthResponse, TokenPayload, User, UserRole } from '../models/user.model';

/**
 * Serviço de Autenticação
 * Gerencia login, logout, tokens e estado do usuário
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Verificar token ao iniciar (apenas no browser)
    if (this.isBrowser) {
      this.checkTokenExpiration();
    }
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Erro no login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }



  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  /**
   * Verifica se o usuário tem qualquer uma das roles fornecidas
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Retorna o token de acesso
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }



  /**
   * Verifica se há um token válido
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Decodifica o token JWT
   */
  private decodeToken(token: string): TokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Verifica expiração do token periodicamente
   */
  private checkTokenExpiration(): void {
    setInterval(() => {
      if (!this.hasValidToken()) {
        this.logout();
      }
    }, 60000); // Verifica a cada minuto
  }

  /**
   * Manipula sucesso na autenticação
   */
  private handleAuthSuccess(response: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, response.access_token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }

    this.currentUserSubject.next(response.user as User);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Recupera usuário do localStorage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;

    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}
