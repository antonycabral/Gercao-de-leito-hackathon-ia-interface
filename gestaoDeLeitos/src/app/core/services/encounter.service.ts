import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Encounter {
  id: string;
  patientId: string;
  locationId?: string;
  responsibleDoctorId?: string;
  status: string;
  startDateTime: Date;
  estimatedDischargeDate?: Date;
  actualDischargeDate?: Date;
  dischargeReason?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: any[];
  patient?: any;
  location?: any;
  responsibleDoctor?: any;
}

export interface CreateEncounterDto {
  patientId: string;
  locationId?: string;
  responsibleDoctorId?: string;
  status?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/encounters`;

  /**
   * Criar nova internação
   */
  create(data: CreateEncounterDto): Observable<Encounter> {
    return this.http.post<Encounter>(this.apiUrl, {
      ...data,
      startDateTime: new Date().toISOString(),
      status: data.status || 'em_atendimento'
    });
  }

  /**
   * Listar todas as internações
   */
  getAll(): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(this.apiUrl);
  }

  /**
   * Listar internações ativas
   */
  getActive(): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(`${this.apiUrl}/active`);
  }

  /**
   * Buscar por ID
   */
  getById(id: string): Observable<Encounter> {
    return this.http.get<Encounter>(`${this.apiUrl}/${id}`);
  }

  /**
   * Buscar por paciente
   */
  getByPatient(patientId: string): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  /**
   * Atualizar internação
   */
  update(id: string, data: Partial<Encounter>): Observable<Encounter> {
    return this.http.put<Encounter>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Atualizar status
   */
  updateStatus(id: string, status: string, note?: string): Observable<Encounter> {
    return this.http.patch<Encounter>(`${this.apiUrl}/${id}/status`, { status, note });
  }

  /**
   * Definir/alterar previsão de alta (EDD)
   */
  setEstimatedDischargeDate(
    id: string,
    estimatedDischargeDate: string,
    justification: string
  ): Observable<Encounter> {
    return this.http.patch<Encounter>(
      `${this.apiUrl}/${id}/estimated-discharge-date`,
      { estimatedDischargeDate, justification }
    );
  }

  /**
   * Adicionar nota
   */
  addNote(id: string, content: string): Observable<Encounter> {
    return this.http.post<Encounter>(`${this.apiUrl}/${id}/notes`, { content });
  }

  /**
   * Realizar alta
   */
  discharge(id: string, dischargeReason: string, notes?: string): Observable<Encounter> {
    return this.http.post<Encounter>(`${this.apiUrl}/${id}/discharge`, {
      dischargeReason,
      notes
    });
  }
}
