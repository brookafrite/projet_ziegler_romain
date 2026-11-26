# Carnet de terrain : le Front Angular

Site de signalement de pollutions, relié à l'API du dossier `api/` (voir `api/README.md`).

## Organisation des dossiers (TP05)

Organisation recommandée par le cours (séance 5) :

| Dossier | Contenu |
|---|---|
| `src/app/core/` | Ce qui n'existe qu'en un exemplaire : `AuthService`, `UserService`, le modèle `User` et les **guards** |
| `src/app/shared/` | Ce qui est réutilisable partout : la pipe `pollutionLevel`, les directives `appHighlightPollution` et `matchPassword` |
| `src/app/features/` | Une fonctionnalité par dossier : `pollutions`, `auth` (connexion, inscription), `admin` (utilisateurs), `not-found` (404) |

## Routes et guards

| Adresse | Guard | Règle | Sinon |
|---|---|---|---|
| `/pollutions`, `/pollutions/:id` | aucun | ouvert à tous | |
| `/pollutions/nouvelle`, `/pollutions/:id/modifier` | `authGuard` (canActivate) | être connecté | `/connexion?retour=…`, puis retour sur la page demandée |
| | `unsavedChangesGuard` (canDeactivate) | pas de saisie en cours | demande « Quitter quand même ? » |
| `/utilisateurs` | `adminGuard` (canMatch) | être admin | connexion si visiteur, liste des pollutions si simple utilisateur |
| `/connexion`, `/inscription` | `guestGuard` (canActivate) | ne pas être connecté | liste des pollutions |
| adresse inconnue | | | page 404 |

`canMatch` est évalué **avant** le chargement à la demande : sans les droits, le code de la
page Utilisateurs n'est même pas téléchargé.

L'authentification reste **fictive** (pas de jeton) : les guards protègent l'interface, pas l'API.

## Lazy loading

Chaque page est chargée à la demande (`loadComponent`), et la fonctionnalité pollutions a son
propre fichier de routes (`loadChildren` → `features/pollutions/pollution.routes.ts`).
`ng build` le montre : avant, tout était dans un seul `main.js` de 98 Ko (compressé) ; après,
le téléchargement initial fait 81 Ko et chaque page est un petit fichier séparé.

## OnPush

Tous les composants déclarent `changeDetection: ChangeDetectionStrategy.OnPush` : Angular ne
les vérifie que si une entrée (`@Input`), un signal lu dans le template ou un événement du
composant change. Depuis Angular 22, c'est déjà la stratégie par défaut ; on l'écrit pour la
rendre visible. La règle d'or est respectée : l'état est dans des signals, et les listes ne
sont jamais modifiées sur place (`filter`, `update` créent un nouveau tableau).

---

## Commandes Angular CLI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
