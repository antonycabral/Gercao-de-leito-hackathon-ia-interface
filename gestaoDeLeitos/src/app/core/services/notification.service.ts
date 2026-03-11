import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Tipo de notificação
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Interface para notificação
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Serviço para gerenciar notificações/toasts
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private defaultDuration = 5000; // 5 segundos

  /**
   * Mostra uma notificação de sucesso
   */
  success(message: string, title?: string, duration?: number): void {
    this.show({
      type: NotificationType.SUCCESS,
      title,
      message,
      duration
    });
  }

  /**
   * Mostra uma notificação de erro
   */
  error(message: string, title?: string, duration?: number): void {
    this.show({
      type: NotificationType.ERROR,
      title: title || 'Erro',
      message,
      duration: duration || 7000 // Erros ficam mais tempo na tela
    });
  }

  /**
   * Mostra uma notificação de aviso
   */
  warning(message: string, title?: string, duration?: number): void {
    this.show({
      type: NotificationType.WARNING,
      title,
      message,
      duration
    });
  }

  /**
   * Mostra uma notificação informativa
   */
  info(message: string, title?: string, duration?: number): void {
    this.show({
      type: NotificationType.INFO,
      title,
      message,
      duration
    });
  }

  /**
   * Mostra uma notificação customizada
   */
  show(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      id: this.generateId(),
      dismissible: true,
      duration: notification.duration || this.defaultDuration,
      ...notification
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, newNotification]);

    // Auto-remove após duração definida
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.dismiss(newNotification.id);
      }, newNotification.duration);
    }
  }

  /**
   * Dispensa uma notificação específica
   */
  dismiss(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  /**
   * Limpa todas as notificações
   */
  clear(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
