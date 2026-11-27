import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';

import { AuthState } from '../../core/states/auth/auth.state';
import { HighlightPollutionDirective } from '../../shared/directives/highlight-pollution.directive';
import { PollutionLevelPipe } from '../../shared/pipes/pollution-level.pipe';
import { PollutionThumbComponent } from '../../shared/components/pollution-thumb/pollution-thumb.component';
import { ForestLandscapeComponent } from '../forest/forest-landscape.component';
import { Pollution, statutLabel } from '../pollutions/models/pollution.model';
import { PollutionService } from '../pollutions/services/pollution.service';
import { homeStats } from './home-stats';

/**
 * Page d'accueil (« / ») en 3 blocs, pour ne pas trop défiler :
 * 1. présentation, « comment ça marche » et les contributions de l'utilisateur connecté ;
 * 2. la forêt et ses chiffres clés ;
 * 3. la dangerosité et les derniers signalements, côte à côte.
 */
@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    RouterLink,
    ForestLandscapeComponent,
    HighlightPollutionDirective,
    PollutionLevelPipe,
    PollutionThumbComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  private readonly store = inject(Store);

  readonly pollutions = signal<Pollution[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /** Tous les chiffres, recalculés si la liste change (voir home-stats.ts). */
  readonly stats = computed(() => homeStats(this.pollutions()));

  /** Utilisateur connecté (store NGXS), pour « Mes contributions ». */
  readonly user = this.store.selectSignal(AuthState.user);
  readonly mine = computed(() => {
    const id = this.user()?.id;
    const own = this.pollutions().filter((p) => id !== undefined && p.auteurId === id);
    return { count: own.length, cleaned: own.filter((p) => p.statut === 'nettoyee').length };
  });

  readonly statutLabel = statutLabel;

  ngOnInit(): void {
    this.pollutionService.getAll().subscribe({
      next: (pollutions) => {
        this.pollutions.set(pollutions);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Les signalements n’ont pas pu être chargés.');
        this.loading.set(false);
      },
    });
  }
}
