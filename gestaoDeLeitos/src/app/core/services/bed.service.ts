import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FhirLocation, BedStatus } from '../models/location.model';

// Mock data para desenvolvimento — substitua pela URL da API real
const MOCK_BEDS: FhirLocation[] = [
  { id: 'loc-101', resourceType: 'Location', alias: ['101-A'], status: 'DISPONIVEL', name: 'Leito 101-A', partOf: { reference: 'Location/wing-sul-1' } },
  { id: 'loc-101b', resourceType: 'Location', alias: ['101-B'], status: 'OCUPADO', name: 'Leito 101-B', partOf: { reference: 'Location/wing-sul-1' } },
  { id: 'loc-102', resourceType: 'Location', alias: ['102-A'], status: 'HIGIENIZACAO', name: 'Leito 102-A', partOf: { reference: 'Location/wing-sul-1' } },
  { id: 'loc-201', resourceType: 'Location', alias: ['201-A'], status: 'EM_MEDICACAO', name: 'Leito 201-A', partOf: { reference: 'Location/wing-norte-2' } },
  { id: 'loc-201b', resourceType: 'Location', alias: ['201-B'], status: 'OCUPADO_AUSENTE', name: 'Leito 201-B', partOf: { reference: 'Location/wing-norte-2' } },
  { id: 'loc-202', resourceType: 'Location', alias: ['202-A'], status: 'DISPONIVEL', name: 'Leito 202-A', partOf: { reference: 'Location/wing-norte-2' } },
  { id: 'loc-301', resourceType: 'Location', alias: ['301-A'], status: 'EM_EXAME', name: 'Leito 301-A (UTI)', partOf: { reference: 'Location/uti-3' } },
  { id: 'loc-301b', resourceType: 'Location', alias: ['301-B'], status: 'MANUTENCAO', name: 'Leito 301-B (UTI)', partOf: { reference: 'Location/uti-3' } },
];

@Injectable({ providedIn: 'root' })
export class BedService {
  private readonly apiUrl = '/api/fhir/Location';

  constructor(private http: HttpClient) {}

  getAllBeds(): Observable<FhirLocation[]> {
    // TODO: substituir por this.http.get<FhirLocation[]>(this.apiUrl)
    return of(MOCK_BEDS);
  }

  getBedById(id: string): Observable<FhirLocation | undefined> {
    return of(MOCK_BEDS.find(b => b.id === id));
  }

  getAvailableBeds(): Observable<FhirLocation[]> {
    return of(MOCK_BEDS.filter(b => b.status === 'DISPONIVEL'));
  }

  updateBedStatus(id: string, status: BedStatus): Observable<FhirLocation> {
    const bed = MOCK_BEDS.find(b => b.id === id);
    if (bed) bed.status = status;
    return of(bed!);
    // TODO: return this.http.patch<FhirLocation>(`${this.apiUrl}/${id}`, { status });
  }

  /** Match automático: retorna o leito disponível mais próximo (RF.01) */
  matchBed(wing?: string): Observable<FhirLocation | undefined> {
    const available = MOCK_BEDS.filter(b => b.status === 'DISPONIVEL');
    const matched = wing
      ? available.find(b => b.partOf?.reference.includes(wing)) ?? available[0]
      : available[0];
    return of(matched);
  }
}
