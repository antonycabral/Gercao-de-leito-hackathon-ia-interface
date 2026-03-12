import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private wsService = inject(WebSocketService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  isConnected$ = this.wsService.messages$.pipe(
    map(() => this.wsService.isConnected())
  );

  pageTitle = 'Dashboard';

  ngOnInit(): void {
    // Conecta ao WebSocket
    this.wsService.connect();

    // Atualiza título da página baseado na rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
  }

  logout(): void {
    this.wsService.disconnect();
    this.authService.logout();
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '?';

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  getRoleLabel(role?: UserRole): string {
    if (!role) return '';

    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.MEDICO]: 'Médico',
      [UserRole.ENFERMEIRO]: 'Enfermeiro',
      [UserRole.ENFERMAGEM]: 'Enfermagem',
      [UserRole.TRIAGEM]: 'Triagem',
      [UserRole.LIMPEZA]: 'Equipe de Limpeza',
      [UserRole.ACOMPANHANTE]: 'Acompanhante'
    };

    return labels[role] || role;
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const titleMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/leitos': 'Gestão de Leitos',
      '/pacientes': 'Pacientes',
      '/tarefas': 'Tarefas'
    };

    this.pageTitle = titleMap[url] || 'Dashboard';
  }
}
