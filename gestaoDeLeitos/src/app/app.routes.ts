import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'leitos',
        loadComponent: () => import('./pages/leitos/leitos.component').then(m => m.LeitosComponent)
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pages/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'tarefas',
        loadComponent: () => import('./pages/tarefas/tarefas.component').then(m => m.TarefasComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard([UserRole.ADMIN])],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./pages/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
          }
        ]
      },
      {
        path: 'medico',
        canActivate: [roleGuard([UserRole.MEDICO])],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/medico/medico-dashboard/medico-dashboard.component').then(m => m.MedicoDashboardComponent)
          }
        ]
      },
      {
        path: 'enfermagem',
        canActivate: [roleGuard([UserRole.ENFERMAGEM])],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/enfermagem/enfermagem-dashboard/enfermagem-dashboard.component').then(m => m.EnfermagemDashboardComponent)
          }
        ]
      },
      {
        path: 'triagem',
        canActivate: [roleGuard([UserRole.TRIAGEM])],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/triagem/triagem-dashboard/triagem-dashboard.component').then(m => m.TriagemDashboardComponent)
          },
          {
            path: 'novo',
            loadComponent: () => import('./pages/triagem/triagem-form/triagem-form.component').then(m => m.TriagemFormComponent)
          },
          {
            path: 'fila-espera',
            loadComponent: () => import('./pages/triagem/fila-espera/fila-espera.component').then(m => m.FilaEsperaComponent)
          }
        ]
      },
      {
        path: 'limpeza',
        canActivate: [roleGuard([UserRole.LIMPEZA])],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/limpeza/limpeza-dashboard/limpeza-dashboard.component').then(m => m.LimpezaDashboardComponent)
          }
        ]
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
