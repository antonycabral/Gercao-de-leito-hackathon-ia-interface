import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.scss']
})
export class TarefasComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  tarefas: any[] = [];
  filteredTarefas: any[] = [];
  loading = false;
  error: string | null = null;
  filterPendentes: boolean = false;
  filterMinhas: boolean = false;
  filterLabel: string = '';

  ngOnInit(): void {
    // Observa mudanças nos query params
    this.route.queryParams.subscribe(params => {
      this.filterPendentes = params['status'] === 'pendentes';
      this.filterMinhas = params['minhas'] === 'true';
      this.updateFilterLabel();
      this.loadTarefas();
    });
  }

  loadTarefas(): void {
    this.loading = true;
    this.error = null;

    this.taskService.getAll().subscribe({
      next: (data) => {
        this.tarefas = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar tarefas';
        this.loading = false;
        console.error('Erro ao carregar tarefas:', err);
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.tarefas];

    // Filtro por status pendente
    if (this.filterPendentes) {
      filtered = filtered.filter(t =>
        t.status === 'solicitada' ||
        t.status === 'aceita' ||
        t.status === 'em_andamento'
      );
    }

    // Filtro por tarefas do usuário logado
    if (this.filterMinhas) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        filtered = filtered.filter(t =>
          t.assignedTo?.id === currentUser.id ||
          t.requestedBy?.id === currentUser.id
        );
      }
    }

    this.filteredTarefas = filtered;
  }

  updateFilterLabel(): void {
    const labels: string[] = [];
    if (this.filterPendentes) labels.push('Pendentes');
    if (this.filterMinhas) labels.push('Minhas Tarefas');
    this.filterLabel = labels.length > 0 ? labels.join(' - ') : '';
  }

  clearFilter(): void {
    this.filterPendentes = false;
    this.filterMinhas = false;
    this.filterLabel = '';
    this.applyFilter();
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'limpeza': 'Limpeza',
      'limpeza_emergencia': 'Limpeza Emergência',
      'manutencao': 'Manutenção',
      'transporte': 'Transporte',
      'medicacao': 'Medicação',
      'exame': 'Exame',
      'visita_medica': 'Visita Médica'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'solicitada': 'Solicitada',
      'aceita': 'Aceita',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'baixa': 'Baixa',
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente',
      'critica': 'Crítica'
    };
    return labels[priority] || priority;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'solicitada': 'status-requested',
      'aceita': 'status-accepted',
      'em_andamento': 'status-in-progress',
      'concluida': 'status-completed',
      'cancelada': 'status-cancelled'
    };
    return classes[status] || '';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'baixa': 'priority-low',
      'normal': 'priority-normal',
      'alta': 'priority-high',
      'urgente': 'priority-urgent',
      'critica': 'priority-critical'
    };
    return classes[priority] || '';
  }

  formatDateTime(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  }
}
