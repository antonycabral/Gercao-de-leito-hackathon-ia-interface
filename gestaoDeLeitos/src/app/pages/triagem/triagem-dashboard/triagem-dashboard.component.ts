import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-triagem-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './triagem-dashboard.component.html',
  styleUrls: ['./triagem-dashboard.component.scss']
})
export class TriagemDashboardComponent {
  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
