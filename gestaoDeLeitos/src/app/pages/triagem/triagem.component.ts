import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BedService } from '../../core/services/bed.service';
import { NotificationService } from '../../core/services/notification.service';
import { RiskColor, RISK_COLOR_LABEL } from '../../core/models/patient.model';

interface TriagemForm {
  patientName: string;
  chiefComplaint: string;
  heartRate: number | null;
  bloodPressureSys: number | null;
  bloodPressureDia: number | null;
  temperature: number | null;
  oxygenSat: number | null;
  riskColor: RiskColor | null;
}

@Component({
  selector: 'app-triagem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './triagem.component.html',
  styleUrl: './triagem.component.scss'
})
export class TriagemComponent {
  form: TriagemForm = {
    patientName: '',
    chiefComplaint: '',
    heartRate: null,
    bloodPressureSys: null,
    bloodPressureDia: null,
    temperature: null,
    oxygenSat: null,
    riskColor: null
  };

  submitted = false;
  availableBed: string | null = null;

  readonly riskColors: Array<{ value: RiskColor; label: string; hex: string }> = [
    { value: 'RED', label: 'Vermelho — Emergência', hex: '#ef4444' },
    { value: 'ORANGE', label: 'Laranja — Muito Urgente', hex: '#f97316' },
    { value: 'YELLOW', label: 'Amarelo — Urgente', hex: '#eab308' },
    { value: 'GREEN', label: 'Verde — Pouco Urgente', hex: '#22c55e' },
    { value: 'BLUE', label: 'Azul — Não Urgente', hex: '#3b82f6' },
  ];

  constructor(
    private bedService: BedService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  selectRisk(color: RiskColor): void {
    this.form.riskColor = color;
    // Sugerir leito automaticamente (RF.01)
    this.bedService.matchBed().subscribe(bed => {
      this.availableBed = bed ? bed.alias[0] : null;
    });
  }

  isValid(): boolean {
    return !!(this.form.patientName && this.form.chiefComplaint && this.form.riskColor);
  }

  onSubmit(): void {
    if (!this.isValid()) return;
    this.submitted = true;
    this.notificationService.success(
      'Triagem Registrada',
      `${this.form.patientName} — ${RISK_COLOR_LABEL[this.form.riskColor!]}`
    );
    setTimeout(() => this.router.navigate(['/dashboard']), 1500);
  }
}
