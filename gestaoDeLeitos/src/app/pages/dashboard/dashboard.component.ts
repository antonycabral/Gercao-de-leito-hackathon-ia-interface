import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BedService } from '../../core/services/bed.service';
import { PatientService } from '../../core/services/patient.service';
import { FhirLocation, BedStatus } from '../../core/models/location.model';
import { FhirEncounter } from '../../core/models/encounter.model';
import { FhirPatient } from '../../core/models/patient.model';
import { TaskService } from '../../core/services/task.service';
import { NotificationService } from '../../core/services/notification.service';
import { LeitoCardComponent } from '../../components/leito-card/leito-card.component';

interface BedCardData {
  bed: FhirLocation;
  encounter?: FhirEncounter;
  patient?: FhirPatient;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LeitoCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  beds: FhirLocation[] = [];
  encounters: FhirEncounter[] = [];
  patients: FhirPatient[] = [];
  bedCards: BedCardData[] = [];
  filterStatus: BedStatus | 'TODOS' = 'TODOS';
  loading = true;

  readonly statusOptions: Array<{ value: BedStatus | 'TODOS'; label: string }> = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'DISPONIVEL', label: 'Disponível' },
    { value: 'OCUPADO', label: 'Ocupado' },
    { value: 'EM_MEDICACAO', label: 'Em Medicação' },
    { value: 'EM_EXAME', label: 'Em Exame' },
    { value: 'HIGIENIZACAO', label: 'Higienização' },
    { value: 'MANUTENCAO', label: 'Manutenção' },
  ];

  constructor(
    private bedService: BedService,
    private patientService: PatientService,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.bedService.getAllBeds().subscribe(beds => {
      this.beds = beds;
      this.patientService.getAllEncounters().subscribe(encounters => {
        this.encounters = encounters;
        this.patientService.getAllPatients().subscribe(patients => {
          this.patients = patients;
          this.buildCards();
          this.loading = false;
        });
      });
    });
  }

  buildCards(): void {
    this.bedCards = this.beds.map(bed => {
      const encounter = this.encounters.find(e =>
        e.location.some(l => l.location.reference === `Location/${bed.id}` && l.status === 'active')
      );
      const patient = encounter
        ? this.patients.find(p => encounter.subject.reference === `Patient/${p.id}`)
        : undefined;
      return { bed, encounter, patient };
    });
  }

  get filteredCards(): BedCardData[] {
    if (this.filterStatus === 'TODOS') return this.bedCards;
    return this.bedCards.filter(c => c.bed.status === this.filterStatus);
  }

  get stats() {
    return {
      total: this.beds.length,
      disponivel: this.beds.filter(b => b.status === 'DISPONIVEL').length,
      ocupado: this.beds.filter(b => ['OCUPADO', 'EM_MEDICACAO', 'EM_EXAME', 'OCUPADO_AUSENTE'].includes(b.status)).length,
      higienizacao: this.beds.filter(b => b.status === 'HIGIENIZACAO').length,
    };
  }

  setFilter(status: BedStatus | 'TODOS'): void {
    this.filterStatus = status;
  }

  getStatusLabel(status: BedStatus): string {
    const map: Record<BedStatus, string> = {
      DISPONIVEL: 'Disponível', OCUPADO: 'Ocupado', HIGIENIZACAO: 'Higienização',
      MANUTENCAO: 'Manutenção', OCUPADO_AUSENTE: 'Paciente Ausente',
      EM_MEDICACAO: 'Em Medicação', EM_EXAME: 'Em Exame'
    };
    return map[status] ?? status;
  }

  getPatientName(patient?: FhirPatient): string {
    return patient?.name?.[0]?.text ?? '—';
  }

  handleEmergencyCleaning(bed: FhirLocation): void {
    const encounter = this.encounters.find(e =>
      e.location.some(l => l.location.reference === `Location/${bed.id}` && l.status === 'active')
    );
    const encounterId = encounter ? encounter.id : 'unknown';
    
    this.taskService.createEmergencyCleaning(bed.id, encounterId).subscribe(() => {
      this.notificationService.danger(
        'Limpeza de Emergência Acionada', 
        `Equipe notificada para o leito ${bed.alias[0]}`
      );
    });
  }
}
