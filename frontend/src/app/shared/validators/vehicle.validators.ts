import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida placas brasileiras tanto no padrão antigo (ABC-1234 / ABC1234)
 * quanto no padrão Mercosul (ABC1D23). Regex segura sem backtracking exponencial (ReDoS).
 */
export function placaBrasileiraValidator(): ValidatorFn {
  const regex = /^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (!valor) {
      return null;
    }
    return regex.test(valor) ? null : { placaInvalida: true };
  };
}

/**
 * Valida se o hodômetro informado no abastecimento é estritamente maior que o hodômetro anterior do veículo.
 */
export function hodometroMaiorQueAnteriorValidator(getHodometroMinimo: () => number | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const minimo = getHodometroMinimo();
    const atual = Number(control.value);
    if (minimo === null || isNaN(atual) || control.value === '' || control.value === null) {
      return null;
    }
    return atual > minimo
      ? null
      : { hodometroMenorOuIgual: { minimo, atual } };
  };
}
