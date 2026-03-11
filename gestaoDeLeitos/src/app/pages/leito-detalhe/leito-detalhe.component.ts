import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { BedService } from '../../core/services/bed.service';
import { FhirEncounter, ENCOUNTER_STATUS_LABEL } from '../../core/models/encounter.model';
import { FhirPatient } from '../../core/models/patient.model';
import { FhirLocation } from '../../core/models/location.model';

@Component({
  selector: 'app-leito-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leito-detalhe.component.html',
  styleUrl: './leito-detalhe.component.scss'
})
export class LeitoDetalheComponent implements OnInit {
  @Input() id!: string; // withComponentInputBinding mapeia o param de rota

  bed?: FhirLocation;
  encounter?: FhirEncounter;
  patient?: FhirPatient;
  loading = true;

  readonly statusLabel = ENCOUNTER_STATUS_LABEL;

  // Timeline mock
  readonly timelineEvents = [
    { time: '08:00', type: 'MEDICACAO', title: 'Antibiótico X', status: 'completed', performer: 'Enf. Ana Lima' },
    { time: '10:30', type: 'EXAME', title: 'Raio-X Tórax', status: 'in-progress', performer: 'Lab. Central' },
    { time: '14:00', type: 'VISITA_MEDICA', title: 'Visita Médica', status: 'requested', performer: 'Dr. Carlos Silva' },
    { time: '18:00', type: 'MEDICACAO', title: 'Antibiótico X (2ª dose)', status: 'requested', performer: '' },
  ];

  constructor(
    private bedService: BedService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.bedService.getBedById(this.id).subscribe(bed => {
      this.bed = bed;
      this.patientService.getEncounterByBedId(this.id).subscribe(enc => {
        this.encounter = enc;
        if (enc) {
          const patientId = enc.subject.reference.split('/')[1];
          this.patientService.getPatientById(patientId).subscribe(pat => {
            this.patient = pat;
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      });
    });
  }

  getPatientName(): string {
    return this.patient?.name?.[0]?.text ?? 'Sem paciente';
  }

  getStatusIcon(type: string): string {
    const map: Record<string, string> = {
      MEDICACAO: '💊', EXAME: '🔬', VISITA_MEDICA: '👨‍⚕️', LIMPEZA: '🧹'
    };
    return map[type] ?? '📋';
  }
}
