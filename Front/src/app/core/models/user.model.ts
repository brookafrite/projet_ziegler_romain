/** Données envoyées à l'API pour créer un compte (sans la confirmation du mot de passe). */
export interface SignUpRequest {
  login: string;
  password: string;
  nom: string;
  prenom: string;
  email: string;
}

/** Identifiants envoyés à l'API pour se connecter. */
export interface LoginRequest {
  login: string;
  password: string;
}

/** Utilisateur renvoyé par l'API (jamais avec son mot de passe). */
export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
}
