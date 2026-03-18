import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { TriagemService } from '../../../core/services/triagem.service';
import { UppercaseDirective } from '../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-triagem-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UppercaseDirective],
  templateUrl: './triagem-form.component.html',
  styleUrls: ['./triagem-form.component.scss']
})
export class TriagemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private triagemService = inject(TriagemService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  patientForm!: FormGroup;
  vitalSignsForm!: FormGroup;
  currentStep: number = 1;
  loading = false;

  // Classificação Manchester
  riskColors = [
    { value: 'vermelho', label: 'Emergência', description: 'Atendimento imediato', icon: '🔴', color: '#DC2626' },
    { value: 'laranja', label: 'Muito Urgente', description: 'Até 10 minutos', icon: '🟠', color: '#FB923C' },
    { value: 'amarelo', label: 'Urgente', description: 'Até 60 minutos', icon: '🟡', color: '#FBBF24' },
    { value: 'verde', label: 'Pouco Urgente', description: 'Até 120 minutos', icon: '🟢', color: '#22C55E' },
    { value: 'azul', label: 'Não Urgente', description: 'Até 240 minutos', icon: '🔵', color: '#3B82F6' }
  ];

  selectedRisk: string = '';

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      documentNumber: ['', Validators.required],
      birthDate: ['', Validators.required],
      phone: [''],
      emergencyContact: [''],
      emergencyPhone: [''],
      chiefComplaint: ['', Validators.required],
      riskColor: ['verde', Validators.required]
    });

    this.vitalSignsForm = this.fb.group({
      temperature: [''],
      heartRate: [''],
      systolic: [''],
      diastolic: [''],
      respiratoryRate: [''],
      oxygenSaturation: [''],
      glucose: [''],
      painScale: [0]
    });
  }

  selectRisk(risk: string): void {
    this.selectedRisk = risk;
    this.patientForm.patchValue({ riskColor: risk });
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.patientForm.invalid) {
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
      return;
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.notificationService.error('Preencha todos os campos obrigatórios', 'Erro');
      return;
    }

    this.loading = true;

    // Monta objeto completo do paciente com sinais vitais
    const patientData = {
      ...this.patientForm.value,
      vitalSigns: this.buildVitalSignsObject(),
    };

    // Usa o novo serviço de triagem que faz alocação automática
    this.triagemService.realizarTriagem(patientData).subscribe({
      next: (response) => {
        const result = response.data;

        if (result.bedAllocated) {
          // Paciente foi alocado em leito
          this.notificationService.success(
            `${result.message}\nLeito: ${result.location?.alias || 'N/A'}`,
            '✅ Triagem Concluída - Leito Alocado',
            5000
          );
          this.loading = false;
          this.router.navigate(['/leitos']);
        } else {
          // Paciente está na fila de espera
          this.notificationService.warning(
            `${result.message}\nO paciente será atendido assim que houver leito disponível.`,
            '⏳ Triagem Concluída - Fila de Espera',
            6000
          );
          this.loading = false;
          this.router.navigate(['/triagem/fila-espera']);
        }
      },
      error: (err) => {
        console.error('Erro ao realizar triagem:', err);
        this.notificationService.error(
          err.error?.message || 'Não foi possível realizar a triagem',
          '❌ Erro'
        );
        this.loading = false;
      }
    });
  }

  buildVitalSignsObject(): any {
    const vs = this.vitalSignsForm.value;
    const vitalSigns: any = {};

    if (vs.temperature) vitalSigns.temperature = parseFloat(vs.temperature);
    if (vs.heartRate) vitalSigns.heartRate = parseInt(vs.heartRate);
    if (vs.systolic && vs.diastolic)
      vitalSigns.bloodPressure = `${vs.systolic}/${vs.diastolic}`;
    if (vs.respiratoryRate) vitalSigns.respiratoryRate = parseInt(vs.respiratoryRate);
    if (vs.oxygenSaturation) vitalSigns.oxygenSaturation = parseInt(vs.oxygenSaturation);
    if (vs.glucose) vitalSigns.glucose = parseInt(vs.glucose);
    if (vs.painScale !== undefined) vitalSigns.painScale = vs.painScale;

    return Object.keys(vitalSigns).length > 0 ? vitalSigns : null;
  }

  buildVitalSignsString(): string {
    const vs = this.vitalSignsForm.value;
    const parts = [];

    if (vs.temperature) parts.push(`Temp: ${vs.temperature}°C`);
    if (vs.heartRate) parts.push(`FC: ${vs.heartRate} BPM`);
    if (vs.systolic && vs.diastolic) parts.push(`PA: ${vs.systolic}/${vs.diastolic} mmHg`);
    if (vs.respiratoryRate) parts.push(`FR: ${vs.respiratoryRate} RPM`);
    if (vs.oxygenSaturation) parts.push(`SpO2: ${vs.oxygenSaturation}%`);
    if (vs.glucose) parts.push(`Glicemia: ${vs.glucose} mg/dL`);
    if (vs.painScale) parts.push(`Dor: ${vs.painScale}/10`);

    return parts.join(' | ');
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  cancel(): void {
    if (confirm('Tem certeza que deseja cancelar? Os dados serão perdidos.')) {
      this.router.navigate(['/triagem']);
    }
  }
}
