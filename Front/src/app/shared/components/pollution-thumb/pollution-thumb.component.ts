import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Miniature d'une pollution : sa photo recadrée, ou la feuille du logo si elle n'en a pas
 * (ou si l'image ne se charge pas). Utilisée dans la liste et sur la page d'accueil.
 */
@Component({
  selector: 'app-pollution-thumb',
  templateUrl: './pollution-thumb.component.html',
  styleUrl: './pollution-thumb.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionThumbComponent {
  readonly photoUrl = input<string | null | undefined>(null);
  /** Vrai si l'image n'a pas pu être chargée : on montre la feuille à la place. */
  readonly broken = signal(false);
}
