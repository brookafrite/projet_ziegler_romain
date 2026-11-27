import { User } from '../../models/user.model';

/**
 * Actions de l'état d'authentification : elles décrivent ce qui arrive, sans rien exécuter.
 * Le « type » explicite ([Auth] …) identifie l'action dans le store.
 */

/** L'utilisateur s'est connecté. Payload : l'utilisateur renvoyé par l'API (sans mot de passe). */
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: User) {}
}

/** L'utilisateur se déconnecte : la session est remise à zéro. */
export class Logout {
  static readonly type = '[Auth] Logout';
}
