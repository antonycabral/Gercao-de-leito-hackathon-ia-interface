import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface WsMessage {
  type: 'BED_STATUS_UPDATE' | 'PATIENT_STATUS_UPDATE' | 'CLEANING_REQUEST' | 'EDD_UPDATE' | 'NOTIFICATION';
  payload: unknown;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<WsMessage>();
  private reconnectInterval = 5000;
  private wsUrl = 'ws://localhost:8080/ws'; // TODO: mover para environment

  public messages$: Observable<WsMessage> = this.messageSubject.asObservable();

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          this.messageSubject.next(msg);
        } catch {
          console.warn('[WebSocket] Mensagem inválida recebida:', event.data);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[WebSocket] Erro de conexão:', err);
      };

      this.ws.onclose = () => {
        console.warn('[WebSocket] Conexão encerrada. Reconectando em', this.reconnectInterval, 'ms...');
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.ws.onopen = () => {
        console.info('[WebSocket] Conectado ao servidor.');
      };
    } catch (err) {
      console.error('[WebSocket] Falha ao criar conexão:', err);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  send(msg: Omit<WsMessage, 'timestamp'>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...msg, timestamp: new Date().toISOString() }));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
