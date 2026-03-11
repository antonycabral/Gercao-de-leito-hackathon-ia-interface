import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FhirLocation } from '../../core/models/location.model';
import { FhirPatient } from '../../core/models/patient.model';
import { FhirEncounter } from '../../core/models/encounter.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-leito-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './leito-card.component.html',
  styleUrl: './leito-card.component.scss'
})
export class LeitoCardComponent {
  @Input({ required: true }) bed!: FhirLocation;
  @Input() encounter?: FhirEncounter;
  @Input() patient?: FhirPatient;
  @Output() cleaningRequest = new EventEmitter<FhirLocation>();

  get patientName(): string {
    return this.patient?.name?.[0]?.text ?? '—';
  }

  get estimatedDischarge(): string | null {
    return this.encounter?.period?.estimatedEnd ?? null;
  }

  get isOverdue(): boolean {
    if (!this.estimatedDischarge) return false;
    return new Date(this.estimatedDischarge) < new Date();
  }

  requestCleaning(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cleaningRequest.emit(this.bed);
  }
}
