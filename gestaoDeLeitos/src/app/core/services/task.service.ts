import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PageResponse, Pageable } from './api.service';

/**
 * Serviço para gerenciar tarefas
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private api = inject(ApiService);
  private readonly endpoint = '/tasks';

  /**
   * Lista todas as tarefas
   */
  getAll(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint);
  }

  /**
   * Lista tarefas com paginação
   */
  getPage(pageable: Pageable, filters?: any): Observable<PageResponse<any>> {
    return this.api.getPage<any>(this.endpoint, pageable, filters);
  }

  /**
   * Busca uma tarefa por ID
   */
  getById(id: string): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Cria uma nova tarefa
   */
  create(task: any): Observable<any> {
    return this.api.post<any>(this.endpoint, task);
  }

  /**
   * Atualiza uma tarefa
   */
  update(id: string, task: any): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, task);
  }

  /**
   * Atualiza parcialmente uma tarefa
   */
  patch(id: string, data: any): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Remove uma tarefa
   */
  delete(id: string): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Busca tarefas pendentes
   */
  getPending(): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/pending`);
  }

  /**
   * Busca tarefas atribuídas a um usuário
   */
  getByUser(userId: string): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/user/${userId}`);
  }

  /**
   * Aceita uma tarefa
   */
  accept(id: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${id}/accept`, {});
  }

  /**
   * Inicia uma tarefa
   */
  start(id: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${id}/start`, {});
  }

  /**
   * Completa uma tarefa
   */
  complete(id: string, notes?: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${id}/complete`, { notes });
  }

  /**
   * Cancela uma tarefa
   */
  cancel(id: string, reason?: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${id}/cancel`, { reason });
  }
}
