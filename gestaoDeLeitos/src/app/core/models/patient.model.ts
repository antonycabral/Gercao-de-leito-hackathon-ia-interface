// FHIR: Patient — dados do paciente (LGPD-safe, sem diagnóstico exposto)

export type RiskColor = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE';

export const RISK_COLOR_LABEL: Record<RiskColor, string> = {
  RED: 'Emergência',
  ORANGE: 'Muito Urgente',
  YELLOW: 'Urgente',
  GREEN: 'Pouco Urgente',
  BLUE: 'Não Urgente'
};

export const RISK_COLOR_HEX: Record<RiskColor, string> = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
  BLUE: '#3b82f6'
};

export interface FhirPatient {
  id: string;
  resourceType: 'Patient';
  name: Array<{ text: string; family?: string; given?: string[] }>;
  // extensão customizada para classificação Manchester (não exposta ao acompanhante)
  extension?: Array<{
    url: 'manchester-risk-color';
    valueCode: RiskColor;
  }>;
  // getter helper
  riskColor?: RiskColor;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
}
