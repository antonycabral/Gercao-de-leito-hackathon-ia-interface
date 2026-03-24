import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status!: string;

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      DISPONIVEL: 'check_circle',
      OCUPADO: 'cancel',
      OCUPADO_AUSENTE: 'person_off',
      EM_MEDICACAO: 'medication',
      HIGIENIZACAO: 'cleaning_services',
      RESERVADO: 'bookmark',
      MANUTENCAO: 'build',
      INATIVO: 'block',
      EMERGENCIA: 'emergency',
      MUITO_URGENTE: 'priority_high',
      URGENTE: 'warning',
      POUCO_URGENTE: 'schedule',
      NAO_URGENTE: 'info',
      REQUESTED: 'assignment_late',
      PENDENTE: 'pending',
      IN_PROGRESS: 'hourglass_top',
      EM_ANDAMENTO: 'hourglass_top',
      COMPLETED: 'task_alt',
      CONCLUIDA: 'task_alt',
      CANCELLED: 'cancel',
      CANCELADA: 'cancel',
      FAILED: 'error'
    };

    return icons[status] || 'label';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      // Location Status
      'DISPONIVEL': 'Disponível',
      'OCUPADO': 'Ocupado',
      'OCUPADO_AUSENTE': 'Ausente',
      'EM_MEDICACAO': 'Medicação',
      'HIGIENIZACAO': 'Limpeza',
      'RESERVADO': 'Reservado',
      'MANUTENCAO': 'Manutenção',
      'INATIVO': 'Inativo',

      // Manchester Protocol
      'EMERGENCIA': 'Emergência',
      'MUITO_URGENTE': 'Muito Urgente',
      'URGENTE': 'Urgente',
      'POUCO_URGENTE': 'Pouco Urgente',
      'NAO_URGENTE': 'Não Urgente',

      // Task Status
      'REQUESTED': 'Solicitado',
      'PENDENTE': 'Pendente',
      'IN_PROGRESS': 'Em Andamento',
      'EM_ANDAMENTO': 'Em Andamento',
      'COMPLETED': 'Concluído',
      'CONCLUIDA': 'Concluída',
      'CANCELLED': 'Cancelado',
      'CANCELADA': 'Cancelada',
      'FAILED': 'Falhou'
    };

    return labels[status] || status;
  }
}
