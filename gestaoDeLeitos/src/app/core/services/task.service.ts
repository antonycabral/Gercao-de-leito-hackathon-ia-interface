import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FhirTask, TaskType, TaskPriority, TaskStatus, ChecklistItem } from '../models/task.model';

const MOCK_TASKS: FhirTask[] = [
  {
    id: 'task-001', resourceType: 'Task', type: 'MEDICACAO', priority: 'ROUTINE',
    status: 'in-progress', for: { reference: 'Encounter/enc-001' },
    location: { reference: 'Location/loc-101b' },
    authoredOn: '2026-03-11T08:00:00Z',
    owner: { display: 'Enf. Ana Lima' },
    note: [{ text: 'Antibiótico X — 500mg IV' }]
  },
  {
    id: 'task-002', resourceType: 'Task', type: 'EXAME', priority: 'URGENT',
    status: 'in-progress', for: { reference: 'Encounter/enc-002' },
    location: { reference: 'Location/loc-201b' },
    authoredOn: '2026-03-11T10:00:00Z',
    note: [{ text: 'Raio-X Tórax' }]
  },
  {
    id: 'task-003', resourceType: 'Task', type: 'LIMPEZA', priority: 'ROUTINE',
    status: 'requested', for: { reference: 'Encounter/enc-003' },
    location: { reference: 'Location/loc-102' },
    authoredOn: '2026-03-11T09:30:00Z',
    checklist: [
      { id: 'lencol', label: '🛏️ Troca de Roupa de Cama', checked: false },
      { id: 'superficie', label: '🧼 Limpeza de Superfícies', checked: false },
      { id: 'banheiro', label: '🚿 Higienização do Banheiro', checked: false },
      { id: 'residuos', label: '🗑️ Descarte de Resíduos', checked: false },
      { id: 'ar', label: '💨 Verificação do Ar Condicionado', checked: false },
    ]
  },
  {
    id: 'task-004', resourceType: 'Task', type: 'LIMPEZA_EMERGENCIA', priority: 'STAT',
    status: 'requested', for: { reference: 'Encounter/enc-001' },
    location: { reference: 'Location/loc-301' },
    authoredOn: '2026-03-11T14:45:00Z',
    checklist: [
      { id: 'lencol', label: '🛏️ Troca de Roupa de Cama', checked: false },
      { id: 'superficie', label: '🧼 Limpeza de Superfícies', checked: false },
      { id: 'residuos', label: '🗑️ Descarte de Resíduos', checked: false },
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = '/api/fhir/Task';

  getAll(): Observable<FhirTask[]> {
    return of(MOCK_TASKS);
  }

  getByType(type: TaskType): Observable<FhirTask[]> {
    return of(MOCK_TASKS.filter(t => t.type === type));
  }

  getCleaningTasks(): Observable<FhirTask[]> {
    return of(MOCK_TASKS.filter(t => t.type === 'LIMPEZA' || t.type === 'LIMPEZA_EMERGENCIA'));
  }

  getByEncounter(encounterId: string): Observable<FhirTask[]> {
    return of(MOCK_TASKS.filter(t => t.for.reference === `Encounter/${encounterId}`));
  }

  updateStatus(taskId: string, status: TaskStatus): Observable<FhirTask> {
    const task = MOCK_TASKS.find(t => t.id === taskId);
    if (task) task.status = status;
    return of(task!);
  }

  /** Criar task de limpeza de emergência — botão pânico (RF.05) */
  createEmergencyCleaning(locationId: string, encounterId: string): Observable<FhirTask> {
    const task: FhirTask = {
      id: `task-emg-${Date.now()}`,
      resourceType: 'Task',
      type: 'LIMPEZA_EMERGENCIA',
      priority: 'STAT',
      status: 'requested',
      for: { reference: `Encounter/${encounterId}` },
      location: { reference: `Location/${locationId}` },
      authoredOn: new Date().toISOString(),
      checklist: [
        { id: 'lencol', label: '🛏️ Troca de Roupa de Cama', checked: false },
        { id: 'superficie', label: '🧼 Limpeza de Superfícies', checked: false },
        { id: 'residuos', label: '🗑️ Descarte de Resíduos', checked: false },
      ]
    };
    MOCK_TASKS.push(task);
    return of(task);
  }
}
