/**
 * Models baseados em FHIR Resource: Location
 * Representa leitos e suas localizações no hospital
 */

/**
 * Status do leito conforme fluxo do sistema
 */
export enum LocationStatus {
  DISPONIVEL = 'DISPONIVEL',
  OCUPADO = 'OCUPADO',
  OCUPADO_AUSENTE = 'OCUPADO_AUSENTE', // Paciente em exame
  EM_MEDICACAO = 'EM_MEDICACAO',
  HIGIENIZACAO = 'HIGIENIZACAO',
  RESERVADO = 'RESERVADO',
  MANUTENCAO = 'MANUTENCAO',
  INATIVO = 'INATIVO'
}

/**
 * Tipo de localização (hierarquia hospital)
 */
export enum LocationType {
  UNIDADE = 'UNIDADE',      // Hospital Central
  BLOCO = 'BLOCO',          // Bloco A, Bloco B
  ANDAR = 'ANDAR',          // 1º Andar, 2º Andar
  ALA = 'ALA',              // Ala Sul, Ala Norte
  LEITO = 'LEITO'           // Leito específico
}

/**
 * Especialidade do leito
 */
export enum LocationSpecialty {
  CLINICA_GERAL = 'CLINICA_GERAL',
  CARDIOLOGIA = 'CARDIOLOGIA',
  INFECTOLOGIA = 'INFECTOLOGIA',
  PEDIATRIA = 'PEDIATRIA',
  MATERNIDADE = 'MATERNIDADE',
  UTI = 'UTI',
  UTI_NEONATAL = 'UTI_NEONATAL',
  EMERGENCIA = 'EMERGENCIA',
  CIRURGIA = 'CIRURGIA'
}

/**
 * Interface para referência de localização pai (partOf)
 */
export interface LocationReference {
  id: string;
  display: string;
  type: LocationType;
}

/**
 * Interface principal Location (FHIR-based)
 */
export interface Location {
  id: string;
  status: LocationStatus;
  operationalStatus?: {
    code: string;
    display: string;
  };
  name: string;
  alias?: string;
  description?: string;
  type: LocationType;
  specialty?: LocationSpecialty;
  partOf?: LocationReference; // Localização pai na hierarquia
  position?: {
    longitude?: number;
    latitude?: number;
    altitude?: number;
  };
  managingOrganization?: {
    id: string;
    display: string;
  };
  // Dados específicos para leitos
  capacity?: number;
  hasOxygen?: boolean;
  hasMonitor?: boolean;
  hasVentilator?: boolean;
  isIsolation?: boolean;
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para tarefa de higienização
 */
export interface CleaningTask {
  id: string;
  locationId: string;
  locationDisplay: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  priority: 'NORMAL' | 'URGENTE' | 'EMERGENCIA';
  type: 'ROTINA' | 'ALTA_PACIENTE' | 'EMERGENCIA' | 'PREVENTIVA';
  requestedBy: string;
  assignedTo?: string;
  requestedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  slaDeadline?: Date;
  checklist?: CleaningChecklist;
  notes?: string;
}

/**
 * Checklist de higienização
 */
export interface CleaningChecklist {
  roupaDeCama: boolean;
  limpezaPiso: boolean;
  desinfeccaoSuperficies: boolean;
  limpezaBanheiro: boolean;
  reposicaoInsumos: boolean;
  inspecaoEquipamentos: boolean;
  observacoes?: string;
}
