import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { observationDateValidator, urlValidator } from '../validators/pollution.validators';

/** Nom d'un champ du formulaire ('titre', 'type', 'latitude'…). */
type FieldName = keyof PollutionFormComponent['form']['controls'];

/** Message affiché sous le bouton de géolocalisation. */
interface GeoMessage {
  kind: 'error' | 'ok';
  text: string;
}

/** Date du jour au format AAAA-MM-JJ, en heure locale. */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Arrondi à 6 décimales (environ 10 cm), largement suffisant. */
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

@Component({
  selector: 'app-pollution-form',
  imports: [ReactiveFormsModule],
  templateUrl: './pollution-form.component.html',
  styleUrl: './pollution-form.component.css',
})
export class PollutionFormComponent implements OnInit {
  /** Pollution à modifier : si elle est fournie, le formulaire est pré-rempli. */
  @Input() pollution: Pollution | null = null;
  @Input() heading = 'Nouveau signalement';
  @Input() submitLabel = 'Déclarer';
  /** Vrai pendant l'enregistrement : le bouton est désactivé. */
  @Input() saving = false;

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

  // Géolocalisation
  readonly locating = signal(false);
  readonly geoMessage = signal<GeoMessage | null>(null);

  // Aperçu de la photo
  readonly photoPreview = signal<string | null>(null);
  readonly previewError = signal(false);

  constructor() {
    // Met à jour l'aperçu dès que l'URL saisie est valide
    this.form.controls.photoUrl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const url = value.trim();
      this.previewError.set(false);
      this.photoPreview.set(url && this.form.controls.photoUrl.valid ? url : null);
    });
  }

  ngOnInit(): void {
    if (this.pollution) {
      const { id, ...values } = this.pollution;
      this.form.patchValue({ ...values, photoUrl: values.photoUrl ?? '' });
    }
  }

  /** Vrai si le champ est invalide et que l'utilisateur l'a déjà touché. */
  showError(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  hasError(name: FieldName, error: string): boolean {
    return this.form.controls[name].hasError(error);
  }

  /** Remplit latitude et longitude avec la position de l'appareil. */
  useMyPosition(): void {
    if (!('geolocation' in navigator)) {
      this.geoMessage.set({
        kind: 'error',
        text: 'Votre navigateur ne permet pas la géolocalisation. Saisissez les coordonnées à la main.',
      });
      return;
    }

    this.locating.set(true);
    this.geoMessage.set(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = this.form.controls;
        latitude.setValue(round6(coords.latitude));
        longitude.setValue(round6(coords.longitude));
        latitude.markAsTouched();
        longitude.markAsTouched();

        this.locating.set(false);
        this.geoMessage.set({
          kind: 'ok',
          text: `Position trouvée, précise à environ ${Math.round(coords.accuracy)} m.`,
        });
      },
      (error) => {
        this.locating.set(false);
        this.geoMessage.set({
          kind: 'error',
          text:
            error.code === error.PERMISSION_DENIED
              ? "L'accès à votre position a été refusé. Autorisez-le dans le navigateur, ou saisissez les coordonnées à la main."
              : "Votre position n'a pas pu être trouvée. Réessayez, ou saisissez les coordonnées à la main.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
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
