import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BedStatus } from '../../core/models/location.model';
import { EncounterStatus } from '../../core/models/encounter.model';

type BadgeStatus = BedStatus | EncounterStatus;

const STATUS_LABELS: Record<string, string> = {
  // Bed
  DISPONIVEL: 'Disponível',
  OCUPADO: 'Ocupado',
  OCUPADO_AUSENTE: 'Paciente Ausente',
  EM_MEDICACAO: 'Em Medicação',
  EM_EXAME: 'Em Exame',
  HIGIENIZACAO: 'Higienização',
  MANUTENCAO: 'Manutenção',
  // Encounter
  TRIAGEM: 'Em Triagem',
  INTERNADO: 'Internado',
  AGUARDANDO_VISITA: 'Aguard. Visita',
  PREVISAO_ALTA: 'Prev. Alta',
  ALTA_CONFIRMADA: 'Alta Confirmada',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge status-badge--{{ status }}">
      {{ label }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: BadgeStatus;

  get label(): string {
    return STATUS_LABELS[this.status] ?? this.status;
  }
}
