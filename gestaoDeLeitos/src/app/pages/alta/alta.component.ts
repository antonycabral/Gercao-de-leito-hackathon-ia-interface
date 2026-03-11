import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { NotificationService } from '../../core/services/notification.service';
import { FhirEncounter, ENCOUNTER_STATUS_LABEL } from '../../core/models/encounter.model';
import { FhirPatient } from '../../core/models/patient.model';

interface AltaCard {
  encounter: FhirEncounter;
  patient?: FhirPatient;
  patientName: string;
  bedCode: string;
  edd: string;
  overdue: boolean;
}

@Component({
  selector: 'app-alta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alta.component.html',
  styleUrl: './alta.component.scss'
})
export class AltaComponent implements OnInit {
  cards: AltaCard[] = [];
  loading = true;
  selectedCard?: AltaCard;
  showModal = false;
  extensionReason = '';
  extensionDate = '';
  todayStr = new Date().toISOString().split('T')[0];

  constructor(
    private patientService: PatientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.patientService.getAllEncounters().subscribe(encounters => {
      this.patientService.getAllPatients().subscribe(patients => {
        this.cards = encounters
          .filter(e => e.period.estimatedEnd)
          .map(e => {
            const patient = patients.find(p => e.subject.reference === `Patient/${p.id}`);
            const edd = e.period.estimatedEnd!;
            return {
              encounter: e,
              patient,
              patientName: patient?.name?.[0]?.text ?? '—',
              bedCode: e.location?.[0]?.location.reference?.split('/')[1] ?? '—',
              edd,
              overdue: new Date(edd) < new Date()
            };
          });
        this.loading = false;
      });
    });
  }

  openExtensionModal(card: AltaCard): void {
    this.selectedCard = card;
    this.extensionReason = '';
    this.extensionDate = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCard = undefined;
  }

  confirmExtension(): void {
    if (!this.selectedCard || !this.extensionReason || !this.extensionDate) return;
    this.patientService
      .updateEDD(this.selectedCard.encounter.id, this.extensionDate, this.extensionReason, 'medico-001')
      .subscribe(() => {
        this.notificationService.warning(
          'Alta Prorrogada',
          `${this.selectedCard!.patientName} — Nova data: ${this.extensionDate}`
        );
        this.closeModal();
        this.ngOnInit(); // Reload
      });
  }

  confirmDischarge(card: AltaCard): void {
    this.patientService.updateEncounterStatus(card.encounter.id, 'ALTA_CONFIRMADA').subscribe(() => {
      this.notificationService.success('Alta Confirmada', `${card.patientName} recebeu alta.`);
      this.cards = this.cards.filter(c => c.encounter.id !== card.encounter.id);
    });
  }
}
