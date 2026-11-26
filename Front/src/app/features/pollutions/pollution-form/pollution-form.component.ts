import { Component, ChangeDetectionStrategy, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, map, of, switchMap } from 'rxjs';
import { HighlightPollutionDirective } from '../../../shared/directives/highlight-pollution.directive';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { PollutionLevelPipe } from '../../../shared/pipes/pollution-level.pipe';
import { observationDateValidator, photoValidator } from '../validators/pollution.validators';
import { MAX_SOURCE_SIZE, base64Size, compressImage, isUploadedPhoto } from '../../../shared/utils/image';
import { AddressService, AddressSuggestion } from '../services/address.service';
import { LocationMapComponent, MapPoint } from '../../../shared/components/location-map/location-map.component';

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
  imports: [ReactiveFormsModule, PollutionLevelPipe, HighlightPollutionDirective, LocationMapComponent],
  templateUrl: './pollution-form.component.html',
  styleUrl: './pollution-form.component.css',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private readonly addressService = inject(AddressService);

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
    photoUrl: ['', photoValidator],
    // Facultatif : vide = « Non évalué »
    indice: this.fb.control<number | null>(null, [Validators.min(0), Validators.pattern(/^\d+$/)]),
  });

  // Géolocalisation
  readonly locating = signal(false);
  readonly geoMessage = signal<GeoMessage | null>(null);

  // Aperçu de la photo
  readonly photoPreview = signal<string | null>(null);
  readonly previewError = signal(false);

  /** Latitude et longitude saisies, en signal : la carte les suit à chaque changement. */
  readonly coordinates = toSignal(
    this.form.valueChanges.pipe(
      map((value) => ({ latitude: value.latitude ?? null, longitude: value.longitude ?? null })),
    ),
    { initialValue: { latitude: null, longitude: null } },
  );

  // Suggestions d'adresse pour le champ Lieu
  readonly suggestions = signal<AddressSuggestion[]>([]);
  readonly activeSuggestion = signal(-1); // suggestion choisie au clavier (-1 : aucune)
  private lieuHasFocus = false; // on ne cherche que pendant la saisie, pas au pré-remplissage

  // Photo envoyée depuis l'appareil
  readonly compressing = signal(false);
  readonly fileError = signal<string | null>(null);

  constructor() {
    // Suggestions d'adresse : on attend une pause de 300 ms dans la frappe (debounceTime),
    // puis on interroge l'API. switchMap annule la recherche précédente si l'on tape encore.
    this.form.controls.lieu.valueChanges
      .pipe(
        map((text) => text.trim()),
        debounceTime(300),
        switchMap((text) =>
          !this.lieuHasFocus || text.length < 3
            ? of([])
            : this.addressService.search(text).pipe(catchError(() => of([]))), // API injoignable : pas de suggestion
        ),
        takeUntilDestroyed(),
      )
      .subscribe((suggestions) => {
        this.suggestions.set(suggestions);
        this.activeSuggestion.set(-1);
      });

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

  /** Vrai si l'utilisateur a modifié au moins un champ (utilisé par unsavedChangesGuard). */
  isDirty(): boolean {
    return this.form.dirty;
  }

  /** Vrai si la photo vient de l'appareil (base64) plutôt que d'une adresse en ligne. */
  hasUploadedPhoto(): boolean {
    return isUploadedPhoto(this.form.controls.photoUrl.value);
  }

  /** Poids de la photo envoyée, en Ko, pour l'afficher sous l'aperçu. */
  uploadedPhotoKb(): number {
    return Math.round(base64Size(this.form.controls.photoUrl.value) / 1024);
  }

  /**
   * Photo choisie sur l'appareil : réduite et compressée dans le navigateur, puis placée dans le
   * champ photoUrl en base64. Elle partira avec le formulaire et sera stockée dans la base.
   */
  async onPhotoFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permet de rechoisir le même fichier
    if (!file) return;

    this.fileError.set(null);
    if (!file.type.startsWith('image/')) {
      this.fileError.set('Ce fichier n’est pas une image. Choisissez une photo (JPEG, PNG, WebP…).');
      return;
    }
    if (file.size > MAX_SOURCE_SIZE) {
      this.fileError.set('Cette photo dépasse 20 Mo. Choisissez une image plus légère.');
      return;
    }

    this.compressing.set(true);
    try {
      const photo = await compressImage(file);
      this.form.controls.photoUrl.setValue(photo);
      this.form.controls.photoUrl.markAsDirty();
    } catch {
      this.fileError.set('Cette image n’a pas pu être lue. Essayez une photo JPEG ou PNG.');
    } finally {
      this.compressing.set(false);
    }
  }

  removePhoto(): void {
    this.form.controls.photoUrl.setValue('');
    this.form.controls.photoUrl.markAsDirty();
  }

  /** Vrai si le champ est invalide et que l'utilisateur l'a déjà touché. */
  showError(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  hasError(name: FieldName, error: string): boolean {
    return this.form.controls[name].hasError(error);
  }

  onLieuFocus(): void {
    this.lieuHasFocus = true;
  }

  onLieuBlur(): void {
    this.lieuHasFocus = false;
    this.suggestions.set([]);
  }

  /** Clavier dans le champ Lieu : flèches pour parcourir les suggestions, Entrée pour choisir, Échap pour fermer. */
  onLieuKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;
    if (!count) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.activeSuggestion.update((index) => (index + step + count) % count);
    } else if (event.key === 'Enter' && this.activeSuggestion() >= 0) {
      event.preventDefault(); // ne pas envoyer le formulaire
      this.chooseSuggestion(this.suggestions()[this.activeSuggestion()]);
    } else if (event.key === 'Escape') {
      this.suggestions.set([]);
    }
  }

  /** Une adresse choisie remplit le lieu, la latitude et la longitude. */
  chooseSuggestion(suggestion: AddressSuggestion): void {
    const { lieu, latitude, longitude } = this.form.controls;
    lieu.setValue(suggestion.label, { emitEvent: false }); // pas de nouvelle recherche
    latitude.setValue(round6(suggestion.latitude));
    longitude.setValue(round6(suggestion.longitude));
    for (const control of [lieu, latitude, longitude]) {
      control.markAsDirty();
      control.markAsTouched();
    }
    this.suggestions.set([]);
    this.geoMessage.set({ kind: 'ok', text: 'Coordonnées remplies d’après l’adresse choisie.' });
  }

  /** Point placé sur la carte (clic ou marqueur déplacé) : il remplit les coordonnées, et le lieu s'il est vide. */
  onMapPicked({ latitude, longitude }: MapPoint): void {
    const controls = this.form.controls;
    controls.latitude.setValue(round6(latitude));
    controls.longitude.setValue(round6(longitude));
    for (const control of [controls.latitude, controls.longitude]) {
      control.markAsDirty();
      control.markAsTouched();
    }
    this.fillLieuFromPosition(latitude, longitude);
    this.geoMessage.set({ kind: 'ok', text: 'Position placée sur la carte.' });
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
        this.fillLieuFromPosition(coords.latitude, coords.longitude);

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
      indice: value.indice ?? null,
    });
  }

  /** Lieu encore vide : on y met l'adresse la plus proche de la position trouvée. */
  private fillLieuFromPosition(lat: number, lon: number): void {
    const { lieu } = this.form.controls;
    if (lieu.value.trim()) return;
    this.addressService.reverse(lat, lon).subscribe({
      next: (address) => {
        if (!address) return;
        lieu.setValue(address.label, { emitEvent: false });
        lieu.markAsDirty();
        lieu.markAsTouched();
      },
      error: () => {}, // sans adresse, l'utilisateur écrit le lieu lui-même
    });
  }
}
