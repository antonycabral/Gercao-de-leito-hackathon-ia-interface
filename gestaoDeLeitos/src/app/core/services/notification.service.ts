import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
  id: string;
  level: NotificationLevel;
  title: string;
  message: string;
  autoDismiss?: boolean;
  dismissAfterMs?: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<AppNotification>();
  public notifications$: Observable<AppNotification> = this.notificationSubject.asObservable();

  private emit(level: NotificationLevel, title: string, message: string, autoDismiss = true): void {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      level,
      title,
      message,
      autoDismiss,
      dismissAfterMs: autoDismiss ? 5000 : undefined,
      timestamp: new Date().toISOString()
    };
    this.notificationSubject.next(notification);
  }

  info(title: string, message: string): void {
    this.emit('info', title, message);
  }

  success(title: string, message: string): void {
    this.emit('success', title, message);
  }

  warning(title: string, message: string): void {
    this.emit('warning', title, message, false);
  }

  danger(title: string, message: string): void {
    this.emit('danger', title, message, false);
  }

  /** Notificação de limpeza de emergência (RF.05) */
  cleaningEmergency(bedCode: string): void {
    this.emit('danger', '🚨 Limpeza de Emergência', `Leito ${bedCode} requer higienização imediata!`, false);
  }

  /** Notificação de previsão de alta (RF.02 / RF.03) */
  dischargeAlert(patientName: string, eddDate: string): void {
    this.emit('warning', '📋 Previsão de Alta', `${patientName} — Alta prevista para ${eddDate}`);
  }
}
