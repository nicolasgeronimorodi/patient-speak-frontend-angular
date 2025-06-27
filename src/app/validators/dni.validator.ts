import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dniValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  // Permitir sólo números, sin puntos
  const dniRegex = /^[0-9]{7,8}$/;

  if (!value) return null;

  return dniRegex.test(value) ? null : { invalidDni: true };
}
