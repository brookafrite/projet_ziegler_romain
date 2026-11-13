import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** Date au format AAAA-MM-JJ, réelle (pas de 31 février) et pas dans le futur. */
export function observationDateValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null; // le cas vide est géré par Validators.required

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { invalidDate: true };

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate) return { invalidDate: true };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) return { futureDate: true };

  return null;
}

/** URL http(s) simple, pour le champ photo (optionnel). */
export const urlValidator: ValidatorFn = Validators.pattern(/^https?:\/\/\S+\.\S+$/i);
