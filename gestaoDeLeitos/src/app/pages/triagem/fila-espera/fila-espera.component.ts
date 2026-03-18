import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../../core/services/location.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FilaEsperaItem, TriagemService } from '../../../core/services/triagem.service';

@Component({
  selector: 'app-fila-espera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fila-espera.component.html',
  styleUrls: ['./fila-espera.component.scss']
})
export class FilaEsperaComponent implements OnInit {
  private triagemService = inject(TriagemService);
  private locationService = inject(LocationService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  filaEspera: FilaEsperaItem[] = [];
  leitosDisponiveis: any[] = [];
  loading = false;
  selectedEncounter: string | null = null;
  selectedBed: string = '';

  ngOnInit(): void {
    this.loadFilaEspera();
    this.loadLeitosDisponiveis();
  }

  loadFilaEspera(): void {
    this.loading = true;
    this.triagemService.getFilaEspera().subscribe({
      next: (response) => {
        this.filaEspera = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar fila de espera:', err);
        this.notificationService.error('Erro ao carregar fila de espera', 'Erro');
        this.loading = false;
      }
    });
  }

  loadLeitosDisponiveis(): void {
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.leitosDisponiveis = locations.filter(l =>
          l.type === 'leito' && l.status === 'disponivel'
        );
      },
      error: (err) => {
        console.error('Erro ao carregar leitos:', err);
      }
    });
  }

  getRiskColor(risk: string): string {
    const colors: any = {
      vermelho: '#DC2626',
      laranja: '#FB923C',
      amarelo: '#FBBF24',
      verde: '#22C55E',
      azul: '#3B82F6'
    };
    return colors[risk] || '#9CA3AF';
  }

  getRiskLabel(risk: string): string {
    const labels: any = {
      vermelho: 'Emergência',
      laranja: 'Muito Urgente',
      amarelo: 'Urgente',
      verde: 'Pouco Urgente',
      azul: 'Não Urgente'
    };
    return labels[risk] || risk;
  }

  selectEncounter(encounterId: string): void {
    this.selectedEncounter = encounterId;
    this.selectedBed = '';
  }

  get pacienteSelecionado(): FilaEsperaItem | undefined {
    return this.filaEspera.find(i => i.encounter.id === this.selectedEncounter);
  }

  get nomePacienteSelecionado(): string {
    return this.pacienteSelecionado?.patient.name || 'N/A';
  }

  alocarLeito(): void {
    if (!this.selectedEncounter || !this.selectedBed) {
      this.notificationService.warning('Selecione um paciente e um leito', 'Atenção');
      return;
    }

    this.loading = true;
    this.triagemService.alocarPacienteEmLeito(this.selectedEncounter, this.selectedBed).subscribe({
      next: (response) => {
        this.notificationService.success(response.message, 'Sucesso');
        this.selectedEncounter = null;
        this.selectedBed = '';
        this.loadFilaEspera();
        this.loadLeitosDisponiveis();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao alocar leito:', err);
        this.notificationService.error(
          err.error?.message || 'Erro ao alocar leito',
          'Erro'
        );
        this.loading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/triagem/dashboard']);
  }

  refreshData(): void {
    this.loadFilaEspera();
    this.loadLeitosDisponiveis();
  }
}
