import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
  private patientService = inject(PatientService);

  pacientes: any[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.loading = true;
    this.error = null;

    this.patientService.getAll().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar pacientes';
        this.loading = false;
        console.error('Erro ao carregar pacientes:', err);
      }
    });
  }

  getRiskColorLabel(color: string): string {
    const labels: Record<string, string> = {
      'vermelho': 'Emergência',
      'laranja': 'Muito Urgente',
      'amarelo': 'Urgente',
      'verde': 'Pouco Urgente',
      'azul': 'Não Urgente'
    };
    return labels[color] || color;
  }

  getRiskColorClass(color: string): string {
    const classes: Record<string, string> = {
      'vermelho': 'risk-red',
      'laranja': 'risk-orange',
      'amarelo': 'risk-yellow',
      'verde': 'risk-green',
      'azul': 'risk-blue'
    };
    return classes[color] || '';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatPhone(phone: string): string {
    if (!phone) return '-';
    return phone;
  }
}
