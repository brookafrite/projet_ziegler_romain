# API

Backend du projet : à venir dans un prochain TP.

En attendant (TP03), l'API est **simulée dans le Front** par un intercepteur HTTP :
`Front/src/app/core/mock-api/`. Il répond aux mêmes routes que le futur backend :

| Méthode | Route                | Rôle                        |
|---------|----------------------|-----------------------------|
| GET     | `/api/pollutions`     | Liste des pollutions        |
| GET     | `/api/pollutions/:id` | Détail d'une pollution      |
| POST    | `/api/pollutions`     | Création (renvoie l'id)     |
| PUT     | `/api/pollutions/:id` | Modification                |
| DELETE  | `/api/pollutions/:id` | Suppression                 |
| POST    | `/api/auth/signup`    | Inscription d'un utilisateur |

Pour utiliser un vrai backend : passer `mockApi` à `false` dans
`Front/src/environments/environment*.ts` et renseigner `apiUrl`.
