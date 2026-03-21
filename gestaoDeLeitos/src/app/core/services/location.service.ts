import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PageResponse, Pageable } from './api.service';

/**
 * Serviço para gerenciar leitos (Locations)
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private api = inject(ApiService);
  private readonly endpoint = '/locations';

  /**
   * Lista todos os leitos
   */
  getAll(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint);
  }

  /**
   * Lista leitos com paginação
   */
  getPage(pageable: Pageable, filters?: any): Observable<PageResponse<any>> {
    return this.api.getPage<any>(this.endpoint, pageable, filters);
  }

  /**
   * Busca um leito por ID
   */
  getById(id: string): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Cria um novo leito
   */
  create(location: any): Observable<any> {
    return this.api.post<any>(this.endpoint, location);
  }

  /**
   * Atualiza um leito
   */
  update(id: string, location: any): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, location);
  }

  /**
   * Atualiza parcialmente um leito
   */
  patch(id: string, data: any): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Remove um leito
   */
  delete(id: string): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Busca leitos disponíveis
   */
  getAvailable(): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/available`);
  }

  /**
   * Busca leitos disponíveis (apenas camas)
   */
  getAvailableBeds(specialization?: string): Observable<any[]> {
    const params = specialization ? { specialization } : {};
    return this.api.get<any[]>(`${this.endpoint}/available-beds`, params);
  }

  /**
   * Atualiza o status de um leito
   */
  updateStatus(id: string, status: string): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/${id}/status`, { status });
  }
}
