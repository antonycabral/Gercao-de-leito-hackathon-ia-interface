import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TriagemResult {
  patient: any;
  encounter: any;
  bedAllocated: boolean;
  location?: any;
  queuePosition?: number;
  message: string;
}

export interface FilaEsperaItem {
  encounter: any;
  patient: any;
  posicao: number;
  tempoEspera: string;
}

@Injectable({
  providedIn: 'root'
})
export class TriagemService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/triagem`;

  /**
   * Realiza triagem completa com alocação automática de leito
   */
  realizarTriagem(patientData: any): Observable<{ success: boolean; data: TriagemResult; message: string }> {
    return this.http.post<{ success: boolean; data: TriagemResult; message: string }>(
      `${this.apiUrl}/realizar`,
      patientData
    );
  }

  /**
   * Busca fila de espera ordenada por prioridade
   */
  getFilaEspera(): Observable<{ success: boolean; data: FilaEsperaItem[]; total: number }> {
    return this.http.get<{ success: boolean; data: FilaEsperaItem[]; total: number }>(
      `${this.apiUrl}/fila-espera`
    );
  }

  /**
   * Aloca paciente da fila em leito específico
   */
  alocarPacienteEmLeito(encounterId: string, locationId: string): Observable<{ success: boolean; data: any; message: string }> {
    return this.http.put<{ success: boolean; data: any; message: string }>(
      `${this.apiUrl}/alocar/${encounterId}/${locationId}`,
      {}
    );
  }
}
