import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard de Leitos'
  },
  {
    path: 'triagem',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/triagem/triagem.component').then(m => m.TriagemComponent),
    title: 'Triagem — Protocolo Manchester'
  },
  {
    path: 'leitos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/leito-detalhe/leito-detalhe.component').then(m => m.LeitoDetalheComponent),
    title: 'Detalhe do Leito'
  },
  {
    path: 'alta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/alta/alta.component').then(m => m.AltaComponent),
    title: 'Gestão de Alta'
  },
  {
    path: 'limpeza',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/limpeza/limpeza.component').then(m => m.LimpezaComponent),
    title: 'App de Limpeza'
  },
  {
    path: 'acompanhante/:token',
    loadComponent: () =>
      import('./pages/acompanhante/acompanhante.component').then(m => m.AcompanhanteComponent),
    title: 'Portal do Acompanhante'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página não encontrada'
  }
];
