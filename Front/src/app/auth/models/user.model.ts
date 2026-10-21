/** Données envoyées à l'API pour créer un compte (sans la confirmation du mot de passe). */
export interface SignUpRequest {
  login: string;
  password: string;
  nom: string;
  prenom: string;
  email: string;
}

/** Utilisateur renvoyé par l'API après l'inscription (sans le mot de passe). */
export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
}
