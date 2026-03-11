import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <div class="not-found__code">404</div>
      <h1 class="not-found__title">Página não encontrada</h1>
      <p class="not-found__desc">A rota que você acessou não existe ou foi movida.</p>
      <a routerLink="/dashboard" class="btn btn--primary">Voltar ao Dashboard</a>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 16px; text-align: center;
    }
    .not-found__code {
      font-size: 6rem; font-weight: 800;
      background: linear-gradient(135deg, #1e6bbf, #00d4ff);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      line-height: 1;
    }
    .not-found__title { font-size: 1.5rem; color: var(--text-primary); }
    .not-found__desc  { color: var(--text-muted); margin-bottom: 8px; }
  `]
})
export class NotFoundComponent {}
