// Modelo de Timeline — Agrega eventos FHIR de um Encounter em ordem cronológica
// Recursos: Task, MedicationAdministration, ServiceRequest, Appointment, Communication

import { TaskType, TaskStatus, TaskPriority } from './task.model';

export type TimelineEventType =
  | 'MEDICACAO'
  | 'EXAME'
  | 'VISITA_MEDICA'
  | 'LIMPEZA'
  | 'NOTA'
  | 'INTERNACAO'
  | 'ALTA'
  | 'TRIAGEM';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  scheduledAt?: string;   // ISO 8601 — quando foi planejado
  executedAt?: string;    // ISO 8601 — quando foi realizado
  status: TaskStatus;
  priority?: TaskPriority;
  performer?: string;     // ex: "Dr. Silva - Cardiologista"
  fhirResource?: 'Task' | 'MedicationAdministration' | 'ServiceRequest' | 'Appointment' | 'Communication';
  fhirResourceId?: string;
}

// Representa o FHIR Bundle de timeline de um paciente (RF.02)
export interface PatientTimeline {
  encounterId: string;
  events: TimelineEvent[];
  lastUpdated: string; // ISO 8601
}
