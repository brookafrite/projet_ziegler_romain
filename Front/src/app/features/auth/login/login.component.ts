import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserService } from '../../../core/services/user.service';
import { Login } from '../../../core/states/auth/auth.actions';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly userService = inject(UserService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  /** Adresse à rouvrir après la connexion (?retour=… ajouté par les guards). */
  readonly retour = input<string>();

  model = { login: '', password: '' };

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(form: NgForm): void {
    if (form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    // L'API vérifie le login et le mot de passe, puis on DISPATCHE l'action Login :
    // c'est le store (AuthState) qui retient l'utilisateur connecté.
    this.userService.login(this.model).subscribe({
      next: (user) => {
        this.store.dispatch(new Login(user));
        this.toastService.success(`Bonjour ${user.prenom} !`);
        this.router.navigateByUrl(this.returnUrl());
      },
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
