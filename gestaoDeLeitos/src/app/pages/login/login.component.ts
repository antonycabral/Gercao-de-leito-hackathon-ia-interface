import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  isProduction = environment.production;
  returnUrl = '/dashboard';

  ngOnInit(): void {
    // Verifica se já está autenticado
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate([this.returnUrl]);
      }
    });

    // Recupera URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Inicializa formulário
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.notificationService.success(
          `Bem-vindo(a), ${response.user.name}!`,
          'Login realizado com sucesso'
        );

        // Redireciona baseado no role
        this.redirectBasedOnRole(response.user.role);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(
          error.message || 'Verifique suas credenciais e tente novamente',
          'Erro ao fazer login'
        );
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Preenche credenciais de demonstração (apenas para desenvolvimento)
   */
  fillDemoCredentials(role: string): void {
    const demoCredentials: Record<string, { email: string; password: string }> = {
      'ADMIN': { email: 'admin@hospital.com', password: 'admin123' },
      'MEDICO': { email: 'medico@hospital.com', password: 'medico123' },
      'ENFERMAGEM': { email: 'enfermagem@hospital.com', password: 'enfermagem123' },
      'TRIAGEM': { email: 'triagem@hospital.com', password: 'triagem123' },
      'LIMPEZA': { email: 'limpeza@hospital.com', password: 'limpeza123' }
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      this.loginForm.patchValue(credentials);
    }
  }

  /**
   * Redireciona usuário baseado no seu role
   */
  private redirectBasedOnRole(role: UserRole): void {
    const redirectMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: '/admin/dashboard',
      [UserRole.MEDICO]: '/medico/dashboard',
      [UserRole.ENFERMAGEM]: '/enfermagem/dashboard',
      [UserRole.TRIAGEM]: '/triagem/dashboard',
      [UserRole.LIMPEZA]: '/limpeza/dashboard',
      [UserRole.ACOMPANHANTE]: '/acompanhante/dashboard'
    };

    const redirectPath = redirectMap[role] || '/dashboard';
    this.router.navigate([redirectPath]);
  }
}
