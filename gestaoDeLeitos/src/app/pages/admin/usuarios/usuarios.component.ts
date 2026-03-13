import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserRole } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { RegisterUserDto, UpdateUserDto, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  usuarios: User[] = [];
  filteredUsuarios: User[] = [];
  loading = true;
  error: string | null = null;

  // Modal
  showModal = false;
  isEditing = false;
  editingUserId: string | null = null;
  userForm!: FormGroup;

  // Filtros
  filterRole: string = '';
  searchTerm: string = '';

  // Roles disponíveis
  roles = [
    { value: UserRole.ADMIN, label: 'Administrador' },
    { value: UserRole.MEDICO, label: 'Médico' },
    { value: UserRole.ENFERMEIRO, label: 'Enfermeiro' },
    { value: UserRole.ENFERMAGEM, label: 'Enfermagem' },
    { value: UserRole.TRIAGEM, label: 'Triagem' },
    { value: UserRole.LIMPEZA, label: 'Limpeza' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadUsuarios();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      cpf: [''],
      specialty: [''],
      coren: [''],
      crm: ['']
    });
  }

  loadUsuarios(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
        this.notificationService.error('Não foi possível carregar a lista de usuários', 'Erro');
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.usuarios];

    // Filtro por role
    if (this.filterRole) {
      filtered = filtered.filter(u => u.role === this.filterRole);
    }

    // Filtro por busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    this.filteredUsuarios = filtered;
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  openEditModal(usuario: User): void {
    this.isEditing = true;
    this.editingUserId = usuario.id;

    this.userForm.patchValue({
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      cpf: usuario.cpf || '',
      specialty: usuario.specialty || '',
      coren: usuario.coren || '',
      crm: usuario.crm || ''
    });

    // Senha opcional ao editar
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
    this.isEditing = false;
    this.editingUserId = null;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.userForm.value;

    if (this.isEditing && this.editingUserId) {
      this.updateUsuario(this.editingUserId, formData);
    } else {
      this.createUsuario(formData);
    }
  }

  createUsuario(data: RegisterUserDto): void {
    this.userService.register(data).subscribe({
      next: () => {
        this.notificationService.success(`Usuário ${data.name} criado com sucesso!`, 'Sucesso');
        this.closeModal();
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        this.notificationService.error(
          err.error?.message || 'Não foi possível criar o usuário',
          'Erro'
        );
      }
    });
  }

  updateUsuario(id: string, data: UpdateUserDto): void {
    // Remove senha vazia
    if (!data.password) {
      delete data.password;
    }

    this.userService.update(id, data).subscribe({
      next: () => {
        this.notificationService.success('Usuário atualizado com sucesso!', 'Sucesso');
        this.closeModal();
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this.notificationService.error(
          err.error?.message || 'Não foi possível atualizar o usuário',
          'Erro'
        );
      }
    });
  }

  toggleStatus(usuario: User): void {
    const action = usuario.active ? 'desativar' : 'ativar';

    if (!confirm(`Tem certeza que deseja ${action} o usuário ${usuario.name}?`)) {
      return;
    }

    const request = usuario.active
      ? this.userService.deactivate(usuario.id)
      : this.userService.activate(usuario.id);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          `Usuário ${usuario.active ? 'desativado' : 'ativado'} com sucesso!`,
          'Sucesso'
        );
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Erro ao alterar status:', err);
        this.notificationService.error('Não foi possível alterar o status do usuário', 'Erro');
      }
    });
  }

  deleteUsuario(usuario: User): void {
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o usuário ${usuario.name}? Esta ação não pode ser desfeita!`)) {
      return;
    }

    this.userService.delete(usuario.id).subscribe({
      next: () => {
        this.notificationService.success('Usuário excluído com sucesso!', 'Sucesso');
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
        this.notificationService.error('Não foi possível excluir o usuário', 'Erro');
      }
    });
  }

  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj?.label || role;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
