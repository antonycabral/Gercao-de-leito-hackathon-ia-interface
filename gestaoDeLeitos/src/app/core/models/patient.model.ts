/**
 * Models baseados em FHIR Resource: Patient
 * Representa pacientes no sistema hospitalar
 */

/**
 * Classificação de Risco (Protocolo Manchester)
 */
export enum RiskClassification {
  EMERGENCIA = 'EMERGENCIA',           // Vermelho - Atendimento imediato
  MUITO_URGENTE = 'MUITO_URGENTE',     // Laranja - Até 10 minutos
  URGENTE = 'URGENTE',                 // Amarelo - Até 60 minutos
  POUCO_URGENTE = 'POUCO_URGENTE',     // Verde - Até 120 minutos
  NAO_URGENTE = 'NAO_URGENTE'          // Azul - Até 240 minutos
}

/**
 * Gênero do paciente
 */
export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
  NAO_INFORMADO = 'NAO_INFORMADO'
}

/**
 * Interface para nome do paciente
 */
export interface HumanName {
  use?: 'official' | 'usual' | 'nickname';
  text: string;
  family?: string;
  given?: string[];
}

/**
 * Interface para endereço
 */
export interface Address {
  use?: 'home' | 'work' | 'temp';
  street: string;
  number?: string;
  complement?: string;
  district?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Interface para contato
 */
export interface ContactPoint {
  system: 'phone' | 'email' | 'sms';
  value: string;
  use?: 'home' | 'work' | 'mobile';
}

/**
 * Interface para contato de emergência
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  telecom: ContactPoint[];
}

/**
 * Interface principal Patient (FHIR-based)
 */
export interface Patient {
  id: string;
  identifier?: {
    system: string;  // CPF, RG, CNS
    value: string;
  }[];
  active: boolean;
  name: HumanName[];
  telecom?: ContactPoint[];
  gender: Gender;
  birthDate: Date;
  age?: number; // Calculado
  deceased?: boolean | Date;
  address?: Address[];
  maritalStatus?: string;
  photo?: string;

  // Dados clínicos
  riskClassification?: RiskClassification;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];

  // Contatos
  contact?: EmergencyContact[];

  // Seguro/Convênio
  insurance?: {
    provider: string;
    planNumber: string;
    validUntil?: Date;
  };

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para sinais vitais
 */
export interface VitalSigns {
  temperature?: number;      // Celsius
  heartRate?: number;       // BPM
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  respiratoryRate?: number; // RPM
  oxygenSaturation?: number; // %
  glucose?: number;         // mg/dL
  weight?: number;          // kg
  height?: number;          // cm
  bmi?: number;             // Calculado
  painScale?: number;       // 0-10
  measuredAt: Date;
  measuredBy: string;
}

/**
 * Interface para dados da triagem
 */
export interface TriageData {
  id: string;
  patientId: string;
  arrivalDate: Date;
  chiefComplaint: string; // Queixa principal
  historyOfPresentIllness?: string;
  vitalSigns: VitalSigns;
  riskClassification: RiskClassification;
  classifiedBy: string; // ID do profissional
  notes?: string;
  requiresImmediateAdmission: boolean;
  suggestedSpecialty?: string;
}
