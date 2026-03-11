// FHIR: Encounter — representa a internação
// Liga FhirLocation (leito) ao FhirPatient e gerencia o ciclo de vida

export type EncounterStatus =
  | 'TRIAGEM'
  | 'INTERNADO'
  | 'EM_MEDICACAO'
  | 'EM_EXAME'
  | 'AGUARDANDO_VISITA'
  | 'PREVISAO_ALTA'
  | 'ALTA_CONFIRMADA';

export const ENCOUNTER_STATUS_LABEL: Record<EncounterStatus, string> = {
  TRIAGEM: 'Em Triagem',
  INTERNADO: 'Internado',
  EM_MEDICACAO: 'Em Medicação',
  EM_EXAME: 'Em Exame',
  AGUARDANDO_VISITA: 'Aguardando Visita Médica',
  PREVISAO_ALTA: 'Previsão de Alta',
  ALTA_CONFIRMADA: 'Alta Confirmada'
};

export interface EddLog {
  previousDate: string;
  newDate: string;
  reason: string;
  physicianId: string;
  timestamp: string; // ISO 8601 — log imutável (RN.05)
}

export interface FhirEncounter {
  id: string;
  resourceType: 'Encounter';
  status: EncounterStatus;
  period: {
    start: string;           // ISO 8601
    estimatedEnd?: string;   // EDD — Estimated Discharge Date
  };
  subject: { reference: string };     // Patient/id
  location: Array<{
    location: { reference: string };  // Location/id (leito)
    status: 'active' | 'reserved' | 'completed';
  }>;
  participant?: Array<{
    individual: { reference: string; display: string }; // Médico responsável
  }>;
  // extensão: log de prorrogações de alta (RN.05 — imutável)
  extension?: Array<{
    url: 'edd-log';
    valueString: string; // JSON serializado de EddLog[]
  }>;
}
