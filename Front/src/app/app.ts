import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
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
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  logout(): void {
    this.authService.logout();
    this.toastService.success('Vous êtes déconnecté.');
    this.router.navigate(['/connexion']);
  }
}
