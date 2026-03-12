import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-leitos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leitos.component.html',
  styleUrls: ['./leitos.component.scss']
})
export class LeitosComponent implements OnInit {
  private locationService = inject(LocationService);

  leitos: any[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadLeitos();
  }

  loadLeitos(): void {
    this.loading = true;
    this.error = null;

    this.locationService.getAll().subscribe({
      next: (data) => {
        this.leitos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar leitos';
        this.loading = false;
        console.error('Erro ao carregar leitos:', err);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'disponivel': 'Disponível',
      'ocupado': 'Ocupado',
      'ocupado_ausente': 'Ocupado (Ausente)',
      'higienizacao_necessaria': 'Higienização Necessária',
      'higienizacao_em_andamento': 'Em Higienização',
      'manutencao': 'Manutenção',
      'bloqueado': 'Bloqueado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'disponivel': 'status-available',
      'ocupado': 'status-occupied',
      'ocupado_ausente': 'status-absent',
      'higienizacao_necessaria': 'status-cleaning-needed',
      'higienizacao_em_andamento': 'status-cleaning',
      'manutencao': 'status-maintenance',
      'bloqueado': 'status-blocked'
    };
    return classes[status] || '';
  }
}
