import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Tipos de eventos WebSocket
 */
export enum WebSocketEventType {
  LOCATION_STATUS_CHANGED = 'LOCATION_STATUS_CHANGED',
  ENCOUNTER_UPDATED = 'ENCOUNTER_UPDATED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  PATIENT_STATUS_CHANGED = 'PATIENT_STATUS_CHANGED',
  CLEANING_TASK_ASSIGNED = 'CLEANING_TASK_ASSIGNED',
  NOTIFICATION = 'NOTIFICATION',
  EDD_CHANGED = 'EDD_CHANGED'
}

/**
 * Interface para mensagem WebSocket
 */
export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: Date;
}

/**
 * Serviço de WebSocket para atualizações em tempo real
 * Implementa comunicação bidirecional com o servidor
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private readonly authService = inject(AuthService);

  private socket?: WebSocket;
  private messageSubject = new Subject<WebSocketMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 segundos
  private isIntentionallyClosed = false;

  /**
   * Observable para receber mensagens
   */
  public messages$ = this.messageSubject.asObservable();

  /**
   * Conecta ao servidor WebSocket
   */
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket já está conectado');
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('Token não encontrado. Não é possível conectar ao WebSocket');
      return;
    }

    const wsUrl = `${environment.wsUrl}?token=${token}`;
    this.isIntentionallyClosed = false;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket conectado');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket desconectado:', event.reason);

        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
    }
  }

  /**
   * Desconecta do servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.isIntentionallyClosed = true;
      this.socket.close();
      this.socket = undefined;
    }
  }

  /**
   * Envia mensagem pelo WebSocket
   */
  send(type: WebSocketEventType, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date()
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket não está conectado');
    }
  }

  /**
   * Inscreve-se em um tipo específico de evento
   */
  on(eventType: WebSocketEventType): Observable<any> {
    return new Observable(observer => {
      const subscription = this.messages$.subscribe(message => {
        if (message.type === eventType) {
          observer.next(message.payload);
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
