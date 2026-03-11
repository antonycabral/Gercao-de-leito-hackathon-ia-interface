/**
 * Models baseados em FHIR Resource: Task
 * Representa tarefas relacionadas ao cuidado do paciente
 */

/**
 * Status da tarefa
 */
export enum TaskStatus {
  DRAFT = 'DRAFT',
  REQUESTED = 'REQUESTED',
  RECEIVED = 'RECEIVED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  ENTERED_IN_ERROR = 'ENTERED_IN_ERROR'
}

/**
 * Prioridade da tarefa
 */
export enum TaskPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  ASAP = 'ASAP',
  STAT = 'STAT' // Imediato/Emergência
}

/**
 * Tipo de tarefa
 */
export enum TaskType {
  MEDICACAO = 'MEDICACAO',
  EXAME = 'EXAME',
  PROCEDIMENTO = 'PROCEDIMENTO',
  CONSULTA = 'CONSULTA',
  HIGIENIZACAO = 'HIGIENIZACAO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  ALTA = 'ALTA',
  VISITA = 'VISITA',
  OBSERVACAO = 'OBSERVACAO',
  OUTRO = 'OUTRO'
}

/**
 * Interface para referência
 */
export interface Reference {
  id: string;
  display: string;
  type?: string;
}

/**
 * Interface para input da tarefa
 */
export interface TaskInput {
  type: {
    text: string;
  };
  value?: any;
}

/**
 * Interface para output da tarefa
 */
export interface TaskOutput {
  type: {
    text: string;
  };
  value?: any;
}

/**
 * Interface principal Task (FHIR-based)
 */
export interface Task {
  id: string;
  identifier?: {
    system: string;
    value: string;
  }[];
  status: TaskStatus;
  statusReason?: string;
  intent: 'PROPOSAL' | 'PLAN' | 'ORDER' | 'ORIGINAL_ORDER' | 'REFLEX_ORDER' | 'FILLER_ORDER' | 'INSTANCE_ORDER' | 'OPTION';
  priority?: TaskPriority;

  // Tipo e código
  code: TaskType;
  description?: string;

  // Paciente/Encounter
  for?: Reference; // Paciente
  encounter?: Reference;

  // Datas
  authoredOn: Date;
  lastModified: Date;
  executionPeriod?: {
    start?: Date;
    end?: Date;
  };
  scheduledTime?: Date; // Horário específico agendado

  // Responsáveis
  requester?: Reference; // Quem solicitou
  owner?: Reference;     // Quem está executando
  location?: Reference;

  // Detalhes
  reasonCode?: {
    code: string;
    text: string;
  };
  reasonReference?: Reference;
  note?: string[];

  // Inputs e Outputs
  input?: TaskInput[];
  output?: TaskOutput[];

  // Relacionamentos
  partOf?: string[]; // Tarefas pai
  basedOn?: string[]; // Baseado em (ex: ServiceRequest)

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface específica para Medicação
 */
export interface MedicationTask extends Task {
  code: TaskType.MEDICACAO;
  medication: {
    name: string;
    dose: string;
    route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICO' | 'INALACAO' | 'OUTRA';
    frequency: string;
    duration?: string;
  };
  administrationTime: Date;
  administered?: boolean;
  administeredBy?: string;
  administeredAt?: Date;
  adverseReaction?: string;
}

/**
 * Interface específica para Exame
 */
export interface ExamTask extends Task {
  code: TaskType.EXAME;
  examType: string;
  examCode?: string;
  specialty?: string;
  requiresPreparation?: boolean;
  preparationInstructions?: string[];
  requiresTransport?: boolean;
  transportStatus?: 'PENDING' | 'IN_TRANSIT' | 'ARRIVED' | 'RETURNED';
  examLocation?: string;
  result?: {
    status: 'PRELIMINARY' | 'FINAL' | 'AMENDED' | 'CORRECTED';
    reportUrl?: string;
    summary?: string;
  };
}

/**
 * Interface específica para Higienização
 */
export interface CleaningTask extends Task {
  code: TaskType.HIGIENIZACAO;
  cleaningType: 'ROTINA' | 'ALTA_PACIENTE' | 'EMERGENCIA' | 'PREVENTIVA';
  locationId: string;
  locationDisplay: string;
  checklist?: {
    roupaDeCama: boolean;
    limpezaPiso: boolean;
    desinfeccaoSuperficies: boolean;
    limpezaBanheiro: boolean;
    reposicaoInsumos: boolean;
    inspecaoEquipamentos: boolean;
  };
  slaDeadline?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Interface para timeline de tarefas do paciente
 */
export interface PatientTimeline {
  patientId: string;
  encounterId: string;
  date: Date;
  tasks: Task[];
  events: {
    time: Date;
    type: 'TASK' | 'VITAL_SIGNS' | 'VISIT' | 'NOTE' | 'STATUS_CHANGE';
    description: string;
    performedBy?: string;
  }[];
}
