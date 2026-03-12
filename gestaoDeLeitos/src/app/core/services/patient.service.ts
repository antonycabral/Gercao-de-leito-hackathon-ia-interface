import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PageResponse, Pageable } from './api.service';

/**
 * Serviço para gerenciar pacientes
 */
@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private api = inject(ApiService);
  private readonly endpoint = '/patients';

  /**
   * Lista todos os pacientes
   */
  getAll(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint);
  }

  /**
   * Lista pacientes com paginação
   */
  getPage(pageable: Pageable, filters?: any): Observable<PageResponse<any>> {
    return this.api.getPage<any>(this.endpoint, pageable, filters);
  }

  /**
   * Busca um paciente por ID
   */
  getById(id: string): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Cria um novo paciente
   */
  create(patient: any): Observable<any> {
    return this.api.post<any>(this.endpoint, patient);
  }

  /**
   * Atualiza um paciente
   */
  update(id: string, patient: any): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, patient);
  }

  /**
   * Atualiza parcialmente um paciente
   */
  patch(id: string, data: any): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Remove um paciente
   */
  delete(id: string): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }

  /**
   * Busca pacientes ativos
   */
  getActive(): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/active`);
  }

  /**
   * Busca pacientes por classificação de risco
   */
  getByRiskColor(color: string): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}`, { riskColor: color });
  }
}
