import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BedService } from '../../core/services/bed.service';
import { NotificationService } from '../../core/services/notification.service';
import { FhirLocation } from '../../core/models/location.model';
import { TaskService } from '../../core/services/task.service';
import { FhirTask, ChecklistItem } from '../../core/models/task.model';

@Component({
  selector: 'app-limpeza',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './limpeza.component.html',
  styleUrl: './limpeza.component.scss'
})
export class LimpezaComponent implements OnInit {
  tasks: FhirTask[] = [];
  loading = true;

  constructor(
    private taskService: TaskService,
    private bedService: BedService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.taskService.getCleaningTasks().subscribe(tasks => {
      // Filtrar apenas requested ou in-progress
      this.tasks = tasks.filter(t => t.status !== 'completed');
      this.loading = false;
    });
  }

  getBedCode(task: FhirTask): string {
    return task.location?.reference?.replace('Location/', '') || '—';
  }

  isEmergency(task: FhirTask): boolean {
    return task.type === 'LIMPEZA_EMERGENCIA' || task.priority === 'STAT';
  }

  acceptTask(task: FhirTask): void {
    this.taskService.updateStatus(task.id, 'in-progress').subscribe(updated => {
      task.status = 'in-progress';
      this.notificationService.info('Limpeza Iniciada', `SLA de limpeza iniciado.`);
    });
  }

  toggleCheck(item: ChecklistItem): void {
    item.checked = !item.checked;
  }

  canFinish(task: FhirTask): boolean {
    if (!task.checklist) return true;
    return task.checklist.every(i => i.checked);
  }

  finishTask(task: FhirTask): void {
    if (!this.canFinish(task)) {
      this.notificationService.warning('Atenção', 'Complete todos os itens do checklist antes de finalizar (RN.02).');
      return;
    }
    
    this.taskService.updateStatus(task.id, 'completed').subscribe(() => {
      task.status = 'completed';
      const bedId = task.location?.reference?.replace('Location/', '');
      if (bedId) {
        this.bedService.updateBedStatus(bedId, 'DISPONIVEL').subscribe(() => {
          this.notificationService.success('Limpeza Concluída', `Leito ${bedId} disponível!`);
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        });
      }
    });
  }
}
