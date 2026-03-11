/**
 * Models baseados em FHIR Resource: Encounter
 * Representa o encontro/internação do paciente
 */

/**
 * Status do Encounter
 */
export enum EncounterStatus {
  PLANNED = 'PLANNED',           // Planejado
  ARRIVED = 'ARRIVED',           // Chegou
  TRIAGED = 'TRIAGED',           // Triado
  IN_PROGRESS = 'IN_PROGRESS',   // Em andamento
  ON_LEAVE = 'ON_LEAVE',         // Ausente temporariamente
  FINISHED = 'FINISHED',         // Finalizado
  CANCELLED = 'CANCELLED',       // Cancelado
  ENTERED_IN_ERROR = 'ENTERED_IN_ERROR'
}

/**
 * Classe do Encounter
 */
export enum EncounterClass {
  EMERGENCY = 'EMERGENCY',       // Emergência
  INPATIENT = 'INPATIENT',       // Internação
  OUTPATIENT = 'OUTPATIENT',     // Ambulatorial
  OBSERVATION = 'OBSERVATION',   // Observação
  VIRTUAL = 'VIRTUAL'            // Telemedicina
}

/**
 * Status do paciente durante a internação
 */
export enum PatientStatus {
  NO_LEITO = 'NO_LEITO',
  EM_EXAME = 'EM_EXAME',
  EM_MEDICACAO = 'EM_MEDICACAO',
  EM_CIRURGIA = 'EM_CIRURGIA',
  AGUARDANDO_VISITA = 'AGUARDANDO_VISITA',
  EM_VISITA = 'EM_VISITA',
  ALTA_PREVISTA = 'ALTA_PREVISTA',
  ALTA_REALIZADA = 'ALTA_REALIZADA'
}

/**
 * Tipo de alta
 */
export enum DischargeDisposition {
  HOME = 'HOME',                 // Alta para casa
  TRANSFER = 'TRANSFER',         // Transferência
  DEATH = 'DEATH',               // Óbito
  OTHER_FACILITY = 'OTHER_FACILITY', // Outra instituição
  EVASION = 'EVASION'            // Evasão
}

/**
 * Interface para referência de paciente
 */
export interface PatientReference {
  id: string;
  display: string;
}

/**
 * Interface para referência de localização
 */
export interface LocationReference {
  id: string;
  display: string;
  period?: {
    start: Date;
    end?: Date;
  };
}

/**
 * Interface para participante do encounter
 */
export interface Participant {
  type: 'MEDICO' | 'ENFERMEIRO' | 'RESIDENTE' | 'ESPECIALISTA';
  period?: {
    start: Date;
    end?: Date;
  };
  individual: {
    id: string;
    display: string;
  };
}

/**
 * Interface para diagnóstico
 */
export interface Diagnosis {
  condition: {
    code: string;
    display: string;
  };
  use: 'ADMISSAO' | 'PRINCIPAL' | 'SECUNDARIO';
  rank?: number;
}

/**
 * Interface para histórico de alteração de EDD
 */
export interface EDDHistory {
  previousDate?: Date;
  newDate: Date;
  reason: string;
  changedBy: string;
  changedAt: Date;
}

/**
 * Interface principal Encounter (FHIR-based)
 */
export interface Encounter {
  id: string;
  identifier?: {
    system: string;
    value: string;
  }[];
  status: EncounterStatus;
  class: EncounterClass;
  patientStatus?: PatientStatus;

  // Referências
  subject: PatientReference; // Paciente
  location?: LocationReference[]; // Histórico de localizações
  participant?: Participant[]; // Profissionais envolvidos

  // Período
  period: {
    start: Date;
    end?: Date;
  };

  // Dados da internação
  admissionDate: Date;
  estimatedDischargeDate?: Date; // EDD - Data prevista de alta
  actualDischargeDate?: Date;
  lengthOfStay?: number; // Dias de internação

  // Histórico de alterações no EDD
  eddHistory?: EDDHistory[];

  // Diagnósticos
  diagnosis?: Diagnosis[];

  // Motivo da internação
  reasonCode?: {
    code: string;
    display: string;
  }[];
  reasonReference?: string; // Referência ao Condition

  // Alta
  hospitalization?: {
    admitSource?: string;
    reAdmission?: boolean;
    dischargeDisposition?: DischargeDisposition;
    dischargeDiagnosis?: string;
    dischargeNotes?: string;
  };

  // Prioridade
  priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para solicitar mudança de leito
 */
export interface BedTransferRequest {
  encounterId: string;
  currentLocationId: string;
  requestedLocationId: string;
  reason: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  requestedBy: string;
  requestedAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

/**
 * Interface para evento da timeline do paciente
 */
export interface EncounterEvent {
  id: string;
  encounterId: string;
  type: 'ADMISSAO' | 'MEDICACAO' | 'EXAME' | 'VISITA' | 'TRANSFERENCIA' | 'ALTA' | 'OUTRO';
  timestamp: Date;
  description: string;
  performedBy?: string;
  location?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}
