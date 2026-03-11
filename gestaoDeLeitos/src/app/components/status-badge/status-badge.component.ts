import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status!: string;

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
