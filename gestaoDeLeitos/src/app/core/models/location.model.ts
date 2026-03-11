// FHIR: Location — representa o leito e sua posição hierárquica no hospital
// Hierarquia: Unidade > Bloco > Andar > Ala > Leito

export type BedStatus =
  | 'DISPONIVEL'
  | 'OCUPADO'
  | 'OCUPADO_AUSENTE'
  | 'EM_MEDICACAO'
  | 'EM_EXAME'
  | 'HIGIENIZACAO'
  | 'MANUTENCAO';

export interface FhirLocation {
  id: string;
  resourceType: 'Location';
  alias: string[];          // ex: ['302-A']
  status: BedStatus;
  name?: string;
  partOf?: { reference: string }; // referência para Ala/Andar/Bloco pai
  physicalType?: {
    coding: Array<{ code: 'bd' | 'wa' | 'lvl' | 'bu'; display: string }>;
  };
  position?: { longitude: number; latitude: number };
}

export interface BedHierarchy {
  unit: string;    // Hospital Central
  block: string;   // Bloco A
  floor: number;   // 2
  wing: string;    // Ala Sul (Cardiologia)
  bedCode: string; // 302-A
}
