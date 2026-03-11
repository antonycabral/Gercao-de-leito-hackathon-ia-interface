import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Portal LGPD-safe: exibe apenas o fluxo do paciente, sem dados clínicos (RF.04)
interface PatientStatus {
  label: string;
  icon: string;
  description: string;
  color: string;
}

const STATUS_MAP: Record<string, PatientStatus> = {
  INTERNADO:         { label: 'Internado — Estável', icon: '🏥', description: 'Seu familiar está sendo acompanhado pela equipe médica.', color: '#2d8bda' },
  EM_MEDICACAO:      { label: 'Em Medicação', icon: '💊', description: 'Seu familiar está recebendo medicação neste momento.', color: '#a78bfa' },
  EM_EXAME:          { label: 'Em Exame', icon: '🔬', description: 'Seu familiar está realizando um exame. Retorna em breve.', color: '#00d4ff' },
  AGUARDANDO_VISITA: { label: 'Aguardando Visita Médica', icon: '👨‍⚕️', description: 'O médico responsável visitará em breve.', color: '#f59e0b' },
  PREVISAO_ALTA:     { label: 'Previsão de Alta', icon: '📋', description: 'Seu familiar está em processo de alta hospitalar.', color: '#10b981' },
  ALTA_CONFIRMADA:   { label: 'Alta Confirmada ✓', icon: '🎉', description: 'Seu familiar recebeu alta. Dirija-se à recepção.', color: '#10b981' },
  TRIAGEM:           { label: 'Em Triagem', icon: '📝', description: 'Seu familiar está sendo avaliado pela equipe de triagem.', color: '#f59e0b' },
};

@Component({
  selector: 'app-acompanhante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acompanhante.component.html',
  styleUrl: './acompanhante.component.scss'
})
export class AcompanhanteComponent implements OnInit {
  @Input() token!: string;

  patientStatus?: PatientStatus;
  patientDisplayName = 'Familiar';
  lastUpdate = new Date();
  loading = true;

  ngOnInit(): void {
    // Simula carregamento via token (será integrado com API real)
    setTimeout(() => {
      this.patientDisplayName = 'Maria S.'; // Iniciais apenas para LGPD
      this.patientStatus = STATUS_MAP['EM_MEDICACAO'];
      this.loading = false;
    }, 800);
  }

  refresh(): void {
    this.loading = true;
    setTimeout(() => {
      this.lastUpdate = new Date();
      this.loading = false;
    }, 600);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
