import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Adresse à rouvrir après la connexion (?retour=… ajouté par les guards). */
  readonly retour = input<string>();

  model = { login: '', password: '' };

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(form: NgForm): void {
    if (form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.model).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl()),
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(this.toMessage(err));
        this.loading.set(false);
      },
    });
  }

  /** Seulement une adresse interne au site (commence par un seul « / »), sinon la liste. */
  private returnUrl(): string {
    const url = this.retour();
    return url?.startsWith('/') && !url.startsWith('//') ? url : '/pollutions';
  }

  private toMessage(err: HttpErrorResponse): string {
    if (err.status === 0) return "Impossible de joindre l'API. Réessayez plus tard.";
    if (err.status === 401) return 'Login ou mot de passe incorrect.';
    return err.error?.message ?? `Erreur ${err.status} lors de la connexion.`;
  }
}
