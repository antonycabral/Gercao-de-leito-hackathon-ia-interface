import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  cpf?: string;
  specialty?: string;
  coren?: string;
  crm?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  cpf?: string;
  specialty?: string;
  coren?: string;
  crm?: string;
  active?: boolean;
}

/**
 * Serviço para gerenciar usuários do sistema
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Lista todos os usuários (apenas ADMIN)
   */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /**
   * Busca um usuário por ID
   */
  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Cria um novo usuário (registro por ADMIN)
   */
  register(userData: RegisterUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData);
  }

  /**
   * Atualiza um usuário
   */
  update(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData);
  }

  /**
   * Desativa um usuário
   */
  deactivate(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, { active: false });
  }

  /**
   * Ativa um usuário
   */
  activate(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, { active: true });
  }

  /**
   * Remove um usuário permanentemente
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
