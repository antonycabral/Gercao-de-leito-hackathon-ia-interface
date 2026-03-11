import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FhirPatient, RiskColor } from '../models/patient.model';
import { FhirEncounter, EncounterStatus, EddLog } from '../models/encounter.model';

// Mock data para desenvolvimento
const MOCK_PATIENTS: FhirPatient[] = [
  { id: 'pat-001', resourceType: 'Patient', name: [{ text: 'Maria Souza', family: 'Souza', given: ['Maria'] }], riskColor: 'ORANGE' },
  { id: 'pat-002', resourceType: 'Patient', name: [{ text: 'João Pereira', family: 'Pereira', given: ['João'] }], riskColor: 'YELLOW' },
  { id: 'pat-003', resourceType: 'Patient', name: [{ text: 'Ana Lima', family: 'Lima', given: ['Ana'] }], riskColor: 'RED' },
  { id: 'pat-004', resourceType: 'Patient', name: [{ text: 'Carlos Mendes', family: 'Mendes', given: ['Carlos'] }], riskColor: 'GREEN' },
];

const MOCK_ENCOUNTERS: FhirEncounter[] = [
  {
    id: 'enc-001', resourceType: 'Encounter', status: 'EM_MEDICACAO',
    period: { start: '2026-03-09T08:00:00Z', estimatedEnd: '2026-03-12T10:00:00Z' },
    subject: { reference: 'Patient/pat-001' },
    location: [{ location: { reference: 'Location/loc-101b' }, status: 'active' }],
  },
  {
    id: 'enc-002', resourceType: 'Encounter', status: 'EM_EXAME',
    period: { start: '2026-03-10T14:00:00Z', estimatedEnd: '2026-03-13T12:00:00Z' },
    subject: { reference: 'Patient/pat-002' },
    location: [{ location: { reference: 'Location/loc-201b' }, status: 'active' }],
  },
  {
    id: 'enc-003', resourceType: 'Encounter', status: 'PREVISAO_ALTA',
    period: { start: '2026-03-08T10:00:00Z', estimatedEnd: '2026-03-11T10:00:00Z' },
    subject: { reference: 'Patient/pat-003' },
    location: [{ location: { reference: 'Location/loc-201' }, status: 'active' }],
  },
];

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly apiPatient = '/api/fhir/Patient';
  private readonly apiEncounter = '/api/fhir/Encounter';

  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<FhirPatient[]> {
    return of(MOCK_PATIENTS);
  }

  getPatientById(id: string): Observable<FhirPatient | undefined> {
    return of(MOCK_PATIENTS.find(p => p.id === id));
  }

  getAllEncounters(): Observable<FhirEncounter[]> {
    return of(MOCK_ENCOUNTERS);
  }

  getEncounterByBedId(locationId: string): Observable<FhirEncounter | undefined> {
    return of(MOCK_ENCOUNTERS.find(e =>
      e.location.some(l => l.location.reference === `Location/${locationId}` && l.status === 'active')
    ));
  }

  updateEncounterStatus(id: string, status: EncounterStatus): Observable<FhirEncounter> {
    const enc = MOCK_ENCOUNTERS.find(e => e.id === id);
    if (enc) enc.status = status;
    return of(enc!);
  }

  /** Atualiza EDD e gera log imutável (RN.05) */
  updateEDD(encounterId: string, newDate: string, reason: string, physicianId: string): Observable<FhirEncounter> {
    const enc = MOCK_ENCOUNTERS.find(e => e.id === encounterId);
    if (!enc) return of({} as FhirEncounter);

    const log: EddLog = {
      previousDate: enc.period.estimatedEnd ?? '',
      newDate,
      reason,
      physicianId,
      timestamp: new Date().toISOString()
    };

    enc.period.estimatedEnd = newDate;
    if (!enc.extension) enc.extension = [];
    const existing = enc.extension.find(e => e.url === 'edd-log');
    if (existing) {
      const logs: EddLog[] = JSON.parse(existing.valueString);
      logs.push(log);
      existing.valueString = JSON.stringify(logs);
    } else {
      enc.extension.push({ url: 'edd-log', valueString: JSON.stringify([log]) });
    }
    return of(enc);
  }
}
