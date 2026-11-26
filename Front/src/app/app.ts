import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout } from './core/states/auth/auth.actions';
import { AuthState } from './core/states/auth/auth.state';
import { ThemeService } from './core/services/theme.service';
import { ToastService } from './core/services/toast.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmDialogComponent, ToastContainerComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('projet_ZIEGLER_Romain');
  /**
   * Store NGXS de l'état d'authentification. Le menu le lit (sélecteurs) et dispatche Logout.
   * L'action Login, elle, est dispatchée par la page Connexion
   * (features/auth/login/login.component.ts), une fois que l'API a vérifié le mot de passe :
   * c'est là que se trouvent le formulaire et l'utilisateur renvoyé par l'API.
   */
  private readonly store = inject(Store);

  // Lecture de l'état d'authentification par les sélecteurs, en signals : le menu se met à jour seul
  protected readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  protected readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  protected readonly username = this.store.selectSignal(AuthState.username);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  protected readonly themeService = inject(ThemeService);

  /** Texte du bouton de thème : le thème actuel, et ce que fera le prochain clic. */
  protected readonly themeLabels = {
    auto: { icon: '◐', name: 'Automatique', next: 'clair' },
    light: { icon: '☀', name: 'Clair', next: 'sombre' },
    dark: { icon: '☾', name: 'Sombre', next: 'automatique' },
  } as const;

  logout(): void {
    this.store.dispatch(new Logout());
    this.toastService.success('Vous êtes déconnecté.');
    this.router.navigate(['/connexion']);
  }
}
