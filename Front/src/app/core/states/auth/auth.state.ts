import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { User } from '../../models/user.model';
import { Login, Logout } from './auth.actions';

/** Forme de l'état d'authentification dans le store. */
export interface AuthStateModel {
  user: User | null;
  isAuthenticated: boolean;
}

/** État au démarrage, et après une déconnexion. */
const DEFAULTS: AuthStateModel = { user: null, isAuthenticated: false };

/**
 * État d'authentification (NGXS) : la source unique qui dit qui est connecté.
 * - name 'auth' : sa clé dans le store, et dans le localStorage (StoragePlugin, voir app.config.ts) ;
 * - les méthodes @Action produisent un NOUVEL état (jamais de modification sur place) ;
 * - les @Selector lisent l'état pour l'interface ; ils sont mémorisés.
 * Authentification fictive : l'API vérifie le mot de passe, mais ne délivre pas encore de jeton.
 */
@State<AuthStateModel>({ name: 'auth', defaults: DEFAULTS })
@Injectable()
export class AuthState {
  // ----- Sélecteurs (lecture seule, sans effet) -----

  @Selector()
  static user(state: AuthStateModel): User | null {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  /** Nom affiché dans le menu : « Romain Ziegler ». */
  @Selector()
  static username(state: AuthStateModel): string {
    return state.user ? `${state.user.prenom} ${state.user.nom}` : '';
  }

  @Selector()
  static isAdmin(state: AuthStateModel): boolean {
    return state.user?.role === 'admin';
  }

  /**
   * Qui peut modifier ou supprimer un signalement : son auteur, ou un admin.
   * Le sélecteur renvoie une fonction, appelée avec l'auteur de la pollution.
   */
  @Selector()
  static canManage(state: AuthStateModel): (auteurId: number | null | undefined) => boolean {
    return (auteurId) => {
      const user = state.user;
      if (!user) return false;
      return user.role === 'admin' || (auteurId != null && auteurId === user.id);
    };
  }

  // ----- Actions (écriture) -----

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login): void {
    ctx.patchState({ user: action.payload, isAuthenticated: true });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    ctx.setState(DEFAULTS);
  }
}
