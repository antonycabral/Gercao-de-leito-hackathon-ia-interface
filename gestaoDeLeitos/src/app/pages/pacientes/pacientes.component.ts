import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { EncounterService } from '../../core/services/encounter.service';
import { LocationService } from '../../core/services/location.service';
import { NotificationService } from '../../core/services/notification.service';
import { PatientService } from '../../core/services/patient.service';
import { TriagemService } from '../../core/services/triagem.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
  private patientService = inject(PatientService);
  private encounterService = inject(EncounterService);
  private triagemService = inject(TriagemService);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  pacientes: any[] = [];
  encounters: Map<string, any> = new Map();
  loading = false;
  error: string | null = null;

  // Modal de alocação
  showAllocationModal = false;
  selectedPatient: any = null;
  selectedEncounter: any = null;
  availableBeds: any[] = [];
  loadingBeds = false;
  allocatingBed = false;

  ngOnInit(): void {
    this.loadPacientes();
    this.loadEncounters();
  }

  loadPacientes(): void {
    this.loading = true;
    this.error = null;

    this.patientService.getAll().subscribe({
      next: (data: any) => {
        this.pacientes = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar pacientes';
        this.loading = false;
        console.error('Erro ao carregar pacientes:', err);
      }
    });
  }

  loadEncounters(): void {
    this.encounterService.getActive().subscribe({
      next: (encounters: any) => {
        this.encounters.clear();
        encounters.forEach((enc: any) => {
          if (enc.patientId) {
            this.encounters.set(enc.patientId, enc);
          }
        });
      },
      error: (err: any) => console.error('Erro ao carregar internações:', err)
    });
  }

  getEncounter(patientId: string): any {
    return this.encounters.get(patientId);
  }

  isPatientInBed(patientId: string): boolean {
    const encounter = this.encounters.get(patientId);
    return encounter && encounter.locationId &&
           !['alta_realizada', 'cancelado'].includes(encounter.status);
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

  /**
   * Verifica se o usuário pode alocar leitos (Triagem, Admin, Médico)
   */
  canAllocateBed(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return [UserRole.TRIAGEM, UserRole.ADMIN, UserRole.MEDICO].includes(user.role);
  }

  /**
   * Verifica se o paciente está aguardando leito (na fila)
   */
  isWaitingForBed(patientId: string): boolean {
    const encounter = this.encounters.get(patientId);
    return encounter && !encounter.locationId &&
           ['aguardando_leito', 'em_atendimento'].includes(encounter.status);
  }

  /**
   * Abre modal de alocação de leito
   */
  openAllocationModal(patient: any): void {
    this.selectedPatient = patient;
    this.selectedEncounter = this.getEncounter(patient.id);

    if (!this.selectedEncounter) {
      this.notificationService.error('Paciente não possui internação ativa', 'Erro');
      return;
    }

    this.showAllocationModal = true;
    this.loadAvailableBeds();
  }

  /**
   * Carrega leitos disponíveis
   */
  loadAvailableBeds(): void {
    this.loadingBeds = true;
    this.availableBeds = [];

    this.locationService.getAvailableBeds().subscribe({
      next: (beds) => {
        this.availableBeds = beds;
        this.loadingBeds = false;

        if (beds.length === 0) {
          this.notificationService.warning('Não há leitos disponíveis no momento', 'Aviso');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar leitos:', err);
        this.notificationService.error('Erro ao carregar leitos disponíveis', 'Erro');
        this.loadingBeds = false;
      }
    });
  }

  /**
   * Aloca paciente em leito específico
   */
  allocateToBed(bedId: string): void {
    if (!this.selectedEncounter || this.allocatingBed) return;

    this.allocatingBed = true;

    this.triagemService.alocarPacienteEmLeito(this.selectedEncounter.id, bedId).subscribe({
      next: (response) => {
        this.notificationService.success(
          response.message || 'Paciente alocado com sucesso!',
          '✅ Sucesso'
        );
        this.closeAllocationModal();
        this.loadPacientes();
        this.loadEncounters();
        this.allocatingBed = false;
      },
      error: (err) => {
        console.error('Erro ao alocar paciente:', err);
        this.notificationService.error(
          err.error?.message || 'Erro ao alocar paciente no leito',
          '❌ Erro'
        );
        this.allocatingBed = false;
      }
    });
  }

  /**
   * Fecha modal de alocação
   */
  closeAllocationModal(): void {
    this.showAllocationModal = false;
    this.selectedPatient = null;
    this.selectedEncounter = null;
    this.availableBeds = [];
  }

  /**
   * Retorna label formatada do tipo de leito
   */
  getBedTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'enfermaria': '🏥 Enfermaria',
      'quarto': '🚪 Quarto',
      'uti': '🏥 UTI',
      'isolamento': '🔒 Isolamento'
    };
    return labels[type] || type;
  }
}
