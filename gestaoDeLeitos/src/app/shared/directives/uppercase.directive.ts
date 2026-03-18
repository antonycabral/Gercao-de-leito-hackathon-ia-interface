import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Diretiva para transformar texto em maiúsculas durante a digitação
 * Uso: <input type="text" appUppercase />
 */
@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = input.value.toUpperCase();

    // Restaura a posição do cursor
    input.setSelectionRange(start, end);

    // Dispara evento para atualizar o ngModel/formControl
    input.dispatchEvent(new Event('input'));
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }
}
