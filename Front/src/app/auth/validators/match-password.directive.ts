import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Validateur Template-driven : vérifie que la valeur du champ
 * est identique à celle passée en entrée.
 * Usage : <input ngModel [appMatchPassword]="model.password">
 */
@Directive({
  selector: '[appMatchPassword]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchPasswordDirective, multi: true }],
})
export class MatchPasswordDirective implements Validator, OnChanges {
  @Input('appMatchPassword') password = '';

  private onChange: () => void = () => {};

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // "required" gère le champ vide
    return control.value === this.password ? null : { passwordMismatch: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  // Revalide la confirmation quand le mot de passe change
  ngOnChanges(): void {
    this.onChange();
  }
}
