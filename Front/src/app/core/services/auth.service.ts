import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { LoginRequest, User } from '../models/user.model';
import { UserService } from './user.service';

const STORAGE_KEY = 'carnet-de-terrain-user';

/**
 * Authentification fictive : l'API vérifie le login et le mot de passe, puis on garde
 * l'utilisateur connecté dans un signal (et dans le localStorage pour survivre à un
 * rechargement). Il n'y a pas de jeton : c'est volontairement simplifié pour le TP.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userService = inject(UserService);
  private readonly user = signal<User | null>(this.restore());

  /** Utilisateur connecté, ou null. Lecture seule pour les composants. */
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);

  login(credentials: LoginRequest): Observable<User> {
    return this.userService.login(credentials).pipe(tap((user) => this.setUser(user)));
  }

  logout(): void {
    this.setUser(null);
  }

  private setUser(user: User | null): void {
    this.user.set(user);
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage indisponible (navigation privée...) : la session reste en mémoire
    }
  }

  private restore(): User | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  }
}
