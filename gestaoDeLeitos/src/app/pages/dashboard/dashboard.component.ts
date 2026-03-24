import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { PatientService } from '../../core/services/patient.service';
import { TaskService } from '../../core/services/task.service';

interface DashboardCard {
  title: string;
  icon: string;
  value: number | string;
  label: string;
  route?: string;
  queryParams?: any;
  color: string;
}

interface QuickAction {
  title: string;
  subtitle: string;
  icon: string;
  route?: string;
  queryParams?: any;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private locationService = inject(LocationService);
  private patientService = inject(PatientService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  userRole: string = '';

  // Dados brutos da API
  private leitos: any[] = [];
  private pacientes: any[] = [];
  private tarefas: any[] = [];

  cards: DashboardCard[] = [];
  quickActions: QuickAction[] = [];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('DASHBOARD: ngOnInit chamado');
    this.initializeWithRetry();
  }

  /**
   * Inicializa o dashboard com retry para aguardar o usuário estar disponível
   */
  private initializeWithRetry(attempt: number = 0): void {
    const maxAttempts = 10; // Máximo 10 tentativas (1 segundo)
    const user = this.authService.getCurrentUser();

    console.log(`DASHBOARD: Tentativa ${attempt + 1} - Usuário:`, user);

    if (user) {
      this.userRole = user.role || '';
      console.log('DASHBOARD: Iniciado para role =', this.userRole);
      this.loadDashboardData();
      return;
    }

    // Se não encontrou o usuário e ainda tem tentativas, tenta novamente
    if (attempt < maxAttempts) {
      console.log('DASHBOARD: Usuário não encontrado, tentando novamente em 100ms...');
      setTimeout(() => {
        this.initializeWithRetry(attempt + 1);
      }, 100);
    } else {
      console.error('DASHBOARD: Usuário não encontrado após', maxAttempts, 'tentativas!');
      this.error = 'Erro ao carregar dados do usuário. Tente fazer login novamente.';
      this.loading = false;
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    console.log('DASHBOARD: Carregando dados da API...');

    forkJoin({
      leitos: this.locationService.getAll(),
      pacientes: this.patientService.getAll(),
      tarefas: this.taskService.getAll()
    }).subscribe({
      next: (data) => {
        console.log('DASHBOARD: Dados recebidos', data);
        this.leitos = data.leitos;
        this.pacientes = data.pacientes;
        this.tarefas = data.tarefas;

        // Construir dashboard baseado na role
        this.buildDashboardForRole();
        this.loading = false;
      },
      error: (err) => {
        console.error('DASHBOARD: Erro ao carregar dados', err);
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;
      }
    });
  }

  buildDashboardForRole(): void {
    console.log('DASHBOARD: Construindo para role =', this.userRole);

    // Limpar arrays
    this.cards = [];
    this.quickActions = [];

    // Construir dashboard específico
    switch (this.userRole) {
      case 'ADMIN':
        this.buildAdminDashboard();
        break;
      case 'MEDICO':
        this.buildMedicoDashboard();
        break;
      case 'ENFERMEIRO':
      case 'ENFERMAGEM':
        this.buildEnfermeiroDashboard();
        break;
      case 'TRIAGEM':
        this.buildTriagemDashboard();
        break;
      case 'LIMPEZA':
        this.buildLimpezaDashboard();
        break;
      default:
        this.buildDefaultDashboard();
    }

    console.log('DASHBOARD: Cards construídos =', this.cards.length);
    console.log('DASHBOARD: Ações construídas =', this.quickActions.length);
  }

  buildAdminDashboard(): void {
    const totalLeitos = this.leitos.length;
    const leitosDisponiveis = this.leitos.filter(l => l.status === 'disponivel').length;
    const leitosOcupados = this.leitos.filter(l => l.status === 'ocupado' || l.status === 'ocupado_ausente').length;
    const pacientesAtivos = this.pacientes.filter(p => p.active).length;
    const tarefasPendentes = this.tarefas.filter(t =>
      t.status === 'solicitada' || t.status === 'aceita' || t.status === 'em_andamento'
    ).length;
    const ocupacaoPercentual = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;

    this.cards = [
      { title: 'Total de Leitos', icon: '🛏️', value: totalLeitos, label: 'Clique para ver todos', route: '/leitos', color: 'total' },
      { title: 'Leitos Disponíveis', icon: '🟢', value: leitosDisponiveis, label: 'Prontos para uso', route: '/leitos', queryParams: { status: 'disponivel' }, color: 'available' },
      { title: 'Leitos Ocupados', icon: '🔴', value: leitosOcupados, label: 'Em uso', route: '/leitos', queryParams: { status: 'ocupado' }, color: 'occupied' },
      { title: 'Taxa de Ocupação', icon: '📊', value: `${ocupacaoPercentual}%`, label: 'Ocupação geral', color: 'occupancy' },
      { title: 'Pacientes Ativos', icon: '👤', value: pacientesAtivos, label: 'Clique para ver lista', route: '/pacientes', color: 'patients' },
      { title: 'Tarefas Pendentes', icon: '✓', value: tarefasPendentes, label: 'Aguardando atenção', route: '/tarefas', queryParams: { status: 'pendentes' }, color: 'tasks' }
    ];

    this.quickActions = [
      { title: 'Gerenciar Usuários', subtitle: 'Criar e editar usuários do sistema', icon: '👥', route: '/admin/usuarios', color: 'usuarios' },
      { title: 'Gerenciar Leitos', subtitle: 'Criar, editar e remover leitos', icon: '🛏️', route: '/leitos', color: 'leitos' },
      { title: 'Ver Relatórios', subtitle: 'Análises e métricas do sistema', icon: '📊', route: '/relatorios', color: 'relatorios' }
    ];
  }

  buildMedicoDashboard(): void {
    const pacientesAtivos = this.pacientes.filter(p => p.active).length;
    const leitosDisponiveis = this.leitos.filter(l => l.status === 'disponivel').length;
    const leitosOcupados = this.leitos.filter(l => l.status === 'ocupado' || l.status === 'ocupado_ausente').length;
    const totalLeitos = this.leitos.length;
    const ocupacaoPercentual = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;

    this.cards = [
      { title: 'Meus Pacientes', icon: '👤', value: pacientesAtivos, label: 'Pacientes internados', route: '/pacientes', color: 'patients' },
      { title: 'Leitos Disponíveis', icon: '🟢', value: leitosDisponiveis, label: 'Para novas internações', route: '/leitos', queryParams: { status: 'disponivel' }, color: 'available' },
      { title: 'Leitos Ocupados', icon: '🔴', value: leitosOcupados, label: 'Com pacientes', route: '/leitos', queryParams: { status: 'ocupado' }, color: 'occupied' },
      { title: 'Taxa de Ocupação', icon: '📊', value: `${ocupacaoPercentual}%`, label: 'Ocupação hospitalar', color: 'occupancy' }
    ];

    this.quickActions = [
      { title: 'Ver Meus Pacientes', subtitle: 'Lista de pacientes sob meus cuidados', icon: '👤', route: '/pacientes', color: 'pacientes' },
      { title: 'Prescrever Medicação', subtitle: 'Criar nova prescrição médica', icon: '💊', route: '/medicacoes', color: 'medicacoes' },
      { title: 'Solicitar Exames', subtitle: 'Requisitar exames laboratoriais', icon: '🔬', route: '/exames', color: 'exames' }
    ];
  }

  buildEnfermeiroDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    const minhasTarefas = this.tarefas.filter(t =>
      (t.status === 'solicitada' || t.status === 'aceita' || t.status === 'em_andamento') &&
      (t.assignedTo?.id === currentUser?.id || t.requestedBy?.id === currentUser?.id)
    ).length;
    const pacientesAtivos = this.pacientes.filter(p => p.active).length;
    const leitosOcupados = this.leitos.filter(l => l.status === 'ocupado' || l.status === 'ocupado_ausente').length;
    const leitosDisponiveis = this.leitos.filter(l => l.status === 'disponivel').length;

    this.cards = [
      { title: 'Minhas Tarefas', icon: '✓', value: minhasTarefas, label: 'Tarefas atribuídas a mim', route: '/tarefas', queryParams: { status: 'pendentes', minhas: 'true' }, color: 'tasks' },
      { title: 'Pacientes Ativos', icon: '👤', value: pacientesAtivos, label: 'Sob meus cuidados', route: '/pacientes', color: 'patients' },
      { title: 'Leitos Ocupados', icon: '🔴', value: leitosOcupados, label: 'Com pacientes', route: '/leitos', queryParams: { status: 'ocupado' }, color: 'occupied' },
      { title: 'Leitos Disponíveis', icon: '🟢', value: leitosDisponiveis, label: 'Prontos para uso', route: '/leitos', queryParams: { status: 'disponivel' }, color: 'available' }
    ];

    this.quickActions = [
      { title: 'Minhas Tarefas', subtitle: 'Ver tarefas pendentes', icon: '✓', route: '/tarefas', queryParams: { status: 'pendentes', minhas: 'true' }, color: 'tarefas' },
      { title: 'Administrar Medicação', subtitle: 'Medicações agendadas', icon: '💉', route: '/medicacoes', color: 'medicacoes' },
      { title: 'Sinais Vitais', subtitle: 'Registrar sinais vitais', icon: '📋', route: '/pacientes', color: 'pacientes' }
    ];
  }

  buildTriagemDashboard(): void {
    const leitosDisponiveis = this.leitos.filter(l => l.status === 'disponivel').length;
    const leitosOcupados = this.leitos.filter(l => l.status === 'ocupado' || l.status === 'ocupado_ausente').length;
    const totalLeitos = this.leitos.length;
    const ocupacaoPercentual = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const totalPacientes = this.pacientes.filter(p => p.active).length;

    this.cards = [
      { title: 'Leitos Disponíveis', icon: '🟢', value: leitosDisponiveis, label: 'Para novas internações', route: '/leitos', queryParams: { status: 'disponivel' }, color: 'available' },
      { title: 'Leitos Ocupados', icon: '🔴', value: leitosOcupados, label: 'Em uso', route: '/leitos', queryParams: { status: 'ocupado' }, color: 'occupied' },
      { title: 'Taxa de Ocupação', icon: '📊', value: `${ocupacaoPercentual}%`, label: 'Ocupação atual', color: 'occupancy' },
      { title: 'Total de Pacientes', icon: '👤', value: totalPacientes, label: 'Pacientes ativos', route: '/pacientes', color: 'patients' }
    ];

    this.quickActions = [
      { title: 'Novo Paciente', subtitle: 'Cadastrar e triar paciente', icon: '➕', route: '/triagem/novo', color: 'pacientes' },
      { title: 'Ver Leitos', subtitle: 'Verificar disponibilidade', icon: '🛏️', route: '/leitos', color: 'leitos' },
      { title: 'Pacientes na Espera', subtitle: 'Aguardando internação', icon: '⏳', route: '/pacientes', color: 'pacientes' }
    ];
  }

  buildLimpezaDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    const leitosEmLimpeza = this.leitos.filter(l =>
      l.status === 'higienizacao_necessaria' || l.status === 'higienizacao_em_andamento'
    ).length;
    const minhasTarefas = this.tarefas.filter(t =>
      (t.status === 'solicitada' || t.status === 'aceita' || t.status === 'em_andamento') &&
      (t.assignedTo?.id === currentUser?.id || t.requestedBy?.id === currentUser?.id)
    ).length;
    const leitosDisponiveis = this.leitos.filter(l => l.status === 'disponivel').length;
    const leitosEmManutencao = this.leitos.filter(l => l.status === 'manutencao').length;

    this.cards = [
      { title: 'Leitos para Limpar', icon: '🧹', value: leitosEmLimpeza, label: 'Necessitam limpeza', route: '/leitos', queryParams: { status: 'higienizacao' }, color: 'cleaning' },
      { title: 'Minhas Tarefas', icon: '✓', value: minhasTarefas, label: 'Tarefas de limpeza', route: '/tarefas', queryParams: { status: 'pendentes', minhas: 'true' }, color: 'tasks' },
      { title: 'Leitos Disponíveis', icon: '🟢', value: leitosDisponiveis, label: 'Limpos e prontos', route: '/leitos', queryParams: { status: 'disponivel' }, color: 'available' },
      { title: 'Em Manutenção', icon: '🔧', value: leitosEmManutencao, label: 'Necessitam reparo', route: '/leitos', queryParams: { status: 'manutencao' }, color: 'maintenance' }
    ];

    this.quickActions = [
      { title: 'Minhas Tarefas', subtitle: 'Ver tarefas de limpeza', icon: '✓', route: '/tarefas', queryParams: { status: 'pendentes', minhas: 'true' }, color: 'tarefas' },
      { title: 'Leitos Pendentes', subtitle: 'Aguardando limpeza', icon: '🧹', route: '/leitos', queryParams: { status: 'higienizacao' }, color: 'leitos' },
      { title: 'Reportar Problema', subtitle: 'Solicitar manutenção', icon: '⚠️', route: '/tarefas/nova', color: 'alert' }
    ];
  }

  buildDefaultDashboard(): void {
    const totalLeitos = this.leitos.length;
    const totalPacientes = this.pacientes.filter(p => p.active).length;

    this.cards = [
      { title: 'Total de Leitos', icon: '🛏️', value: totalLeitos, label: 'Ver todos', route: '/leitos', color: 'total' },
      { title: 'Pacientes Ativos', icon: '👤', value: totalPacientes, label: 'Ver lista', route: '/pacientes', color: 'patients' }
    ];

    this.quickActions = [
      { title: 'Ver Leitos', subtitle: 'Status dos leitos', icon: '🛏️', route: '/leitos', color: 'leitos' }
    ];
  }

  handleCardClick(card: DashboardCard): void {
    if (card.route) {
      this.navigateTo(card.route, card.queryParams);
    }
  }

  handleActionClick(action: QuickAction): void {
    if (action.route) {
      this.navigateTo(action.route, action.queryParams);
    }
  }

  navigateTo(route: string, queryParams?: any): void {
    this.router.navigate([route], { queryParams });
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'Usuário';
  }

  getUserRoleLabel(): string {
    const roleLabels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'MEDICO': 'Médico',
      'ENFERMEIRO': 'Enfermeiro',
      'ENFERMAGEM': 'Enfermagem',
      'TRIAGEM': 'Triagem',
      'LIMPEZA': 'Limpeza'
    };
    return roleLabels[this.userRole] || 'Usuário';
  }

  getProgressBarWidth(): number {
    // Extrair percentual do card de Taxa de Ocupação
    const ocupacaoCard = this.cards.find(c => c.title === 'Taxa de Ocupação');
    if (ocupacaoCard && typeof ocupacaoCard.value === 'string') {
      return parseInt(ocupacaoCard.value.replace('%', '')) || 0;
    }
    return 0;
  }

  getMaterialIcon(icon: string): string {
    const iconMap: Record<string, string> = {
      '🛏️': 'bed',
      '🟢': 'check_circle',
      '🔴': 'cancel',
      '📊': 'bar_chart',
      '👤': 'person',
      '✓': 'task_alt',
      '👥': 'group',
      '💊': 'medication',
      '🔬': 'science',
      '💉': 'vaccines',
      '📋': 'assignment',
      '➕': 'add_circle',
      '⏳': 'hourglass_top',
      '🧹': 'cleaning_services',
      '🔧': 'build',
      '⚠️': 'warning'
    };

    return iconMap[icon] || 'dashboard';
  }
}
