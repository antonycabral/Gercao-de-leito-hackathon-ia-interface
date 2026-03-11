import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WebsocketService } from './core/services/websocket.service';
import { NotificationService, AppNotification } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Gestão de Leitos';
  sidebarCollapsed = false;
  notifications: AppNotification[] = [];

  readonly navLinks = [
    { path: '/dashboard', icon: '🏥', label: 'Dashboard', end: true },
    { path: '/triagem', icon: '🚨', label: 'Triagem' },
    { path: '/alta', icon: '📋', label: 'Gestão de Alta' },
    { path: '/limpeza', icon: '🧹', label: 'Limpeza' },
  ];

  constructor(
    private wsService: WebsocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.wsService.connect();
    this.notificationService.notifications$.subscribe(notification => {
      this.notifications.unshift(notification);
      if (notification.autoDismiss && notification.dismissAfterMs) {
        setTimeout(() => this.dismissNotification(notification.id), notification.dismissAfterMs);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
