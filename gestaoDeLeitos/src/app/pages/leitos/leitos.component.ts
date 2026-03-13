import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-leitos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './leitos.component.html',
  styleUrls: ['./leitos.component.scss']
})
export class LeitosComponent implements OnInit {
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  leitos: any[] = [];
  filteredLeitos: any[] = [];
  loading = false;
  error: string | null = null;
  filterStatus: string | null = null;
  filterLabel: string = '';

  // Modal
  showModal = false;
  isEditing = false;
  editingLeitoId: string | null = null;
  leitoForm!: FormGroup;

  // Verifica se é admin
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  ngOnInit(): void {
    this.initForm();

    // Observa mudanças nos query params
    this.route.queryParams.subscribe(params => {
      this.filterStatus = params['status'] || null;
      this.updateFilterLabel();
      this.loadLeitos();
    });
  }

  initForm(): void {
    this.leitoForm = this.fb.group({
      alias: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      status: ['disponivel', Validators.required],
      type: ['LEITO', Validators.required],
      specialty: [''],
      floor: [''],
      building: [''],
      capacity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadLeitos(): void {
    this.loading = true;
    this.error = null;

    this.locationService.getAll().subscribe({
      next: (data) => {
        this.leitos = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar leitos';
        this.loading = false;
        console.error('Erro ao carregar leitos:', err);
      }
    });
  }

  applyFilter(): void {
    if (!this.filterStatus) {
      this.filteredLeitos = this.leitos;
      return;
    }

    if (this.filterStatus === 'disponivel') {
      this.filteredLeitos = this.leitos.filter(l => l.status === 'disponivel');
    } else if (this.filterStatus === 'ocupado') {
      this.filteredLeitos = this.leitos.filter(l =>
        l.status === 'ocupado' || l.status === 'ocupado_ausente'
      );
    } else {
      this.filteredLeitos = this.leitos;
    }
  }

  updateFilterLabel(): void {
    if (this.filterStatus === 'disponivel') {
      this.filterLabel = 'Leitos Disponíveis';
    } else if (this.filterStatus === 'ocupado') {
      this.filterLabel = 'Leitos Ocupados';
    } else {
      this.filterLabel = '';
    }
  }

  clearFilter(): void {
    this.filterStatus = null;
    this.filterLabel = '';
    this.applyFilter();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'disponivel': 'Disponível',
      'ocupado': 'Ocupado',
      'ocupado_ausente': 'Ocupado (Ausente)',
      'higienizacao_necessaria': 'Higienização Necessária',
      'higienizacao_em_andamento': 'Em Higienização',
      'manutencao': 'Manutenção',
      'bloqueado': 'Bloqueado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'disponivel': 'status-available',
      'ocupado': 'status-occupied',
      'ocupado_ausente': 'status-absent',
      'higienizacao_necessaria': 'status-cleaning-needed',
      'higienizacao_em_andamento': 'status-cleaning',
      'manutencao': 'status-maintenance',
      'bloqueado': 'status-blocked'
    };
    return classes[status] || '';
  }

  // ============ CRUD METHODS ============

  openCreateModal(): void {
    this.isEditing = false;
    this.editingLeitoId = null;
    this.leitoForm.reset({
      status: 'disponivel',
      type: 'LEITO',
      capacity: 1
    });
    this.showModal = true;
  }

  openEditModal(leito: any): void {
    this.isEditing = true;
    this.editingLeitoId = leito.id;

    this.leitoForm.patchValue({
      alias: leito.alias,
      name: leito.name,
      description: leito.description || '',
      status: leito.status,
      type: leito.type || 'LEITO',
      specialty: leito.specialty || '',
      floor: leito.floor || '',
      building: leito.building || '',
      capacity: leito.capacity || 1
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.leitoForm.reset();
    this.isEditing = false;
    this.editingLeitoId = null;
  }

  onSubmit(): void {
    if (this.leitoForm.invalid) {
      Object.keys(this.leitoForm.controls).forEach(key => {
        this.leitoForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.leitoForm.value;

    if (this.isEditing && this.editingLeitoId) {
      this.updateLeito(this.editingLeitoId, formData);
    } else {
      this.createLeito(formData);
    }
  }

  createLeito(data: any): void {
    this.locationService.create(data).subscribe({
      next: () => {
        this.notificationService.success(`Leito ${data.alias} criado com sucesso!`, 'Sucesso');
        this.closeModal();
        this.loadLeitos();
      },
      error: (err) => {
        console.error('Erro ao criar leito:', err);
        this.notificationService.error(
          err.error?.message || 'Não foi possível criar o leito',
          'Erro'
        );
      }
    });
  }

  updateLeito(id: string, data: any): void {
    this.locationService.update(id, data).subscribe({
      next: () => {
        this.notificationService.success('Leito atualizado com sucesso!', 'Sucesso');
        this.closeModal();
        this.loadLeitos();
      },
      error: (err) => {
        console.error('Erro ao atualizar leito:', err);
        this.notificationService.error(
          err.error?.message || 'Não foi possível atualizar o leito',
          'Erro'
        );
      }
    });
  }

  deleteLeito(leito: any): void {
    if (!confirm(`Tem certeza que deseja excluir o leito ${leito.alias}? Esta ação não pode ser desfeita!`)) {
      return;
    }

    this.locationService.delete(leito.id).subscribe({
      next: () => {
        this.notificationService.success('Leito excluído com sucesso!', 'Sucesso');
        this.loadLeitos();
      },
      error: (err) => {
        console.error('Erro ao excluir leito:', err);
        this.notificationService.error('Não foi possível excluir o leito', 'Erro');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.leitoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
