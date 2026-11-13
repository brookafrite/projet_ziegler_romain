import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  model = { login: '', password: '' };

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(form: NgForm): void {
    if (form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.model).subscribe({
      next: () => this.router.navigate(['/pollutions']),
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(this.toMessage(err));
        this.loading.set(false);
      },
    });
  }

  private toMessage(err: HttpErrorResponse): string {
    if (err.status === 0) return "Impossible de joindre l'API. Réessayez plus tard.";
    if (err.status === 401) return 'Login ou mot de passe incorrect.';
    return err.error?.message ?? `Erreur ${err.status} lors de la connexion.`;
  }
}
