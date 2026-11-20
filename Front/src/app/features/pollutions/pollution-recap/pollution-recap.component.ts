import { DatePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, OnChanges, signal } from '@angular/core';
import { HighlightPollutionDirective } from '../../../shared/directives/highlight-pollution.directive';
import { Pollution } from '../models/pollution.model';
import { PollutionLevelPipe } from '../../../shared/pipes/pollution-level.pipe';

@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe, PollutionLevelPipe, HighlightPollutionDirective],
  templateUrl: './pollution-recap.component.html',
  styleUrl: './pollution-recap.component.css',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionRecapComponent implements OnChanges {
  @Input({ required: true }) pollution!: Pollution;
  /** Affiche le tampon « Signalement enregistré » (juste après une déclaration). */
  @Input() showStamp = false;

  /** Vrai si l'image n'a pas pu être chargée. Un signal : la vue est prévenue de chaque changement. */
  readonly imageError = signal(false);

  ngOnChanges(): void {
    this.imageError.set(false); // nouvelle fiche : on retente l'affichage de l'image
  }

  /** Numéro de fiche sur 3 chiffres : 1 → "001". */
  get numero(): string {
    return String(this.pollution.id ?? 0).padStart(3, '0');
  }

  get mapUrl(): string {
    const { latitude, longitude } = this.pollution;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }
}
