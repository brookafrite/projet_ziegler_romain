import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { MatchPasswordDirective } from './match-password.directive';

interface SignUpModel {
  login: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  email: string;
}

const EMPTY_MODEL: SignUpModel = {
  login: '',
  password: '',
  confirmPassword: '',
  nom: '',
  prenom: '',
  email: '',
};

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, MatchPasswordDirective],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  private readonly authService = inject(AuthService);

  model: SignUpModel = { ...EMPTY_MODEL };
  showPassword = false;

  // État de l'appel API, piloté par des signals
  readonly loading = signal(false);
  readonly createdUser = signal<User | null>(null);
  readonly errorMessage = signal<string | null>(null);

  /** Force du mot de passe : de 0 (vide) à 4 (excellent). */
  get strength(): number {
    const p = this.model.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.max(score, 1);
  }

  get strengthLabel(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Excellent'][this.strength];
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.loading()) return; // sécurité en plus du bouton désactivé

    const { confirmPassword, ...payload } = this.model;
    this.loading.set(true);
    this.errorMessage.set(null);

    // Requête HTTP « one-shot » : l'Observable se termine tout seul, pas besoin d'unsubscribe.
    this.authService.signUp(payload).subscribe({
      next: (user) => {
        this.createdUser.set(user);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(this.toMessage(err));
        this.loading.set(false);
      },
    });
  }

  newSignUp(): void {
    this.model = { ...EMPTY_MODEL };
    this.showPassword = false;
    this.createdUser.set(null);
    this.errorMessage.set(null);
  }

  private toMessage(err: HttpErrorResponse): string {
    if (err.status === 0) return "Impossible de joindre l'API. Réessayez plus tard.";
    if (err.status === 409) return 'Ce login ou cet email est déjà utilisé.';
    return err.error?.message ?? `Erreur ${err.status} lors de l'inscription.`;
  }
}
