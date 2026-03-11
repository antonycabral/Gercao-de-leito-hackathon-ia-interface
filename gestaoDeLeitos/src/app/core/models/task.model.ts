// FHIR: Task — eventos de cuidado gerados por um Encounter
// Cobre: Limpeza, Medicação, Exame, Visita Médica, Triagem

export type TaskType =
  | 'LIMPEZA'
  | 'LIMPEZA_EMERGENCIA'
  | 'MEDICACAO'
  | 'EXAME'
  | 'VISITA_MEDICA'
  | 'TRIAGEM';

export type TaskPriority = 'ROUTINE' | 'URGENT' | 'ASAP' | 'STAT';

export type TaskStatus =
  | 'requested'
  | 'received'
  | 'accepted'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  LIMPEZA: 'Higienização',
  LIMPEZA_EMERGENCIA: 'Limpeza de Emergência',
  MEDICACAO: 'Medicação',
  EXAME: 'Exame',
  VISITA_MEDICA: 'Visita Médica',
  TRIAGEM: 'Triagem'
};

export const TASK_TYPE_ICON: Record<TaskType, string> = {
  LIMPEZA: 'cleaning_services',
  LIMPEZA_EMERGENCIA: 'warning',
  MEDICACAO: 'medication',
  EXAME: 'biotech',
  VISITA_MEDICA: 'stethoscope',
  TRIAGEM: 'assignment'
};

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface FhirTask {
  id: string;
  resourceType: 'Task';
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  for: { reference: string };           // Encounter/id
  location?: { reference: string };     // Location/id (leito)
  authoredOn: string;                   // ISO 8601
  lastModified?: string;
  owner?: { display: string };          // Responsável (ex: agente de limpeza)
  note?: Array<{ text: string }>;
  // extensão: checklist de limpeza (RN.02)
  checklist?: ChecklistItem[];
  slaDeadline?: string;                 // ISO 8601 — SLA de higienização
}
