import { Component, EventEmitter, Output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { observationDateValidator, urlValidator } from '../validators/pollution.validators';

/** Nom d'un champ du formulaire ('titre', 'type', 'latitude'…). */
type FieldName = keyof PollutionFormComponent['form']['controls'];

/** Date du jour au format AAAA-MM-JJ, en heure locale. */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-pollution-form',
  imports: [ReactiveFormsModule],
  templateUrl: './pollution-form.component.html',
  styleUrl: './pollution-form.component.css',
})
export class PollutionFormComponent {
  @Output() declared = new EventEmitter<Pollution>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly types = POLLUTION_TYPES;
  readonly today = todayIso(); // borne max du champ date

  readonly form = this.fb.group({
    titre: ['', [Validators.required, Validators.maxLength(100)]],
    type: this.fb.control<PollutionType | ''>('', Validators.required),
    description: ['', Validators.required],
    dateObservation: ['', [Validators.required, observationDateValidator]],
    lieu: ['', Validators.required],
    latitude: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(-90),
      Validators.max(90),
    ]),
    longitude: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(-180),
      Validators.max(180),
    ]),
    photoUrl: ['', urlValidator],
  });

  /** Vrai si le champ est invalide et que l'utilisateur l'a déjà touché. */
  showError(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  hasError(name: FieldName, error: string): boolean {
    return this.form.controls[name].hasError(error);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // affiche toutes les erreurs d'un coup
      return;
    }

    const value = this.form.getRawValue();
    this.declared.emit({
      ...value,
      type: value.type as PollutionType,
      latitude: value.latitude as number,
      longitude: value.longitude as number,
      titre: value.titre.trim(),
      lieu: value.lieu.trim(),
      photoUrl: value.photoUrl.trim() || null,
    });
  }
}
