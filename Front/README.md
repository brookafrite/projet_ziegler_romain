# Carnet de terrain : le Front Angular

Site de signalement de pollutions, relié à l'API du dossier `api/` (voir `api/README.md`).

## Organisation des dossiers (TP05)

Organisation recommandée par le cours (séance 5) :

| Dossier | Contenu |
|---|---|
| `src/app/core/` | Ce qui n'existe qu'en un exemplaire : `AuthService`, `UserService`, le modèle `User` et les **guards** |
| `src/app/shared/` | Ce qui est réutilisable partout : la pipe `pollutionLevel`, les directives `appHighlightPollution` et `matchPassword`, les composants `ToastContainer` et `ConfirmDialog` |
| `src/app/features/` | Une fonctionnalité par dossier : `pollutions`, `auth` (connexion, inscription), `admin` (utilisateurs), `not-found` (404) |

## Routes et guards

| Adresse | Guard | Règle | Sinon |
|---|---|---|---|
| `/pollutions`, `/pollutions/:id` | aucun | ouvert à tous | |
| `/pollutions/nouvelle`, `/pollutions/:id/modifier` | `authGuard` (canActivate) | être connecté | `/connexion?retour=…`, puis retour sur la page demandée |
| | `unsavedChangesGuard` (canDeactivate) | pas de saisie en cours | demande « Quitter quand même ? » |
| `/pollutions/:id/modifier` | `pollutionAuthorGuard` (canActivate) | être l'auteur du signalement ou admin | la fiche de la pollution |
| `/utilisateurs` | `adminGuard` (canMatch) | être admin | connexion si visiteur, liste des pollutions si simple utilisateur |
| `/connexion`, `/inscription` | `guestGuard` (canActivate) | ne pas être connecté | liste des pollutions |
| adresse inconnue | | | page 404 |

`canMatch` est évalué **avant** le chargement à la demande : sans les droits, le code de la
page Utilisateurs n'est même pas téléchargé.

L'authentification reste **fictive** (pas de jeton) : les guards protègent l'interface, pas l'API.

## Filtres et tri de la liste, dans l'adresse

Les critères de la liste des pollutions sont des **paramètres de requête** (query params) :
une recherche se partage par lien ou se met en favori.

| Paramètre | Exemple | Effet |
|---|---|---|
| `recherche` | `?recherche=canal` | texte cherché dans le titre, le type, le lieu et la description (sans tenir compte des accents) |
| `type` | `?type=Chimique` | type de pollution |
| `du`, `au` | `?du=2026-10-01&au=2026-10-31` | période d'observation |
| `niveau` | `?niveau=elevee` | niveau de dangerosité : `non-evalue`, `faible`, `moderee`, `elevee`, `dangereuse` |
| `auteur` | `?auteur=moi` | seulement les pollutions de l'utilisateur connecté (case « Seulement mes pollutions », ignorée si personne n'est connecté) |
| `tri` | `?tri=dangereuses` | ordre : plus récentes (par défaut), `anciennes`, `dangereuses`, `moins-dangereuses` |

Le composant lit ces paramètres comme des entrées (`input()`), grâce à `withComponentInputBinding`.
Changer un filtre met l'adresse à jour (`router.navigate` avec `queryParamsHandling: 'merge'`),
et la liste se recalcule. Les pollutions non évaluées restent à la fin des tris par dangerosité.

## Auteur des pollutions et droits

Chaque pollution garde son auteur (l'utilisateur connecté au moment du signalement). La fiche
affiche « Publiée par … », la liste « par … ». `AuthService.canManage(auteurId)` décide qui peut
modifier ou supprimer : **l'auteur, ou un admin**. Une pollution sans auteur (signalée avant
cette évolution) n'est gérée que par un admin. Les boutons sont masqués pour les autres, et
`pollutionAuthorGuard` les empêche d'ouvrir la page Modifier par son adresse.

Ces règles sont appliquées par le Front : tant que l'authentification est fictive, l'API ne
les vérifie pas encore. Le jeton JWT d'un prochain TP les fera vérifier par l'API.

## Habillage

| Élément | Où | Principe |
|---|---|---|
| Notifications | `core/services/toast.service.ts`, `shared/components/toast-container/` | `toastService.success('…')` ou `.error('…')` depuis n'importe quelle page ; la notification s'efface seule (4 s, 7 s pour une erreur) |
| Fenêtre de confirmation | `core/services/confirm.service.ts`, `shared/components/confirm-dialog/` | `await confirmService.ask({ title, message, confirmLabel, danger })` renvoie `true` ou `false`. Élément `<dialog>` natif : modal, Échap pour annuler, focus sur « Annuler » |
| Miniatures | liste des pollutions | la photo recadrée en 64 × 64, ou la feuille du logo si elle manque ou ne se charge pas |
| Thème clair / sombre | `src/styles.css`, `core/services/theme.service.ts` | chaque couleur est une variable écrite une fois avec `light-dark(clair, sombre)`. Le bouton du menu passe de **Automatique** (suit l'ordinateur) à **Clair** puis **Sombre** : `ThemeService` pose `data-theme` sur `<html>` et retient le choix dans le localStorage. Un petit script de `index.html` l'applique avant le démarrage d'Angular, pour éviter un éclair du mauvais thème |

Le `ToastContainer` et le `ConfirmDialog` sont placés une seule fois, dans `app.html`.
Les deux services sont dans `core/` (un seul exemplaire pour toute l'application), les composants
qui les affichent dans `shared/`.

## Formulaire de signalement : photo, adresse et carte

| Fonction | Où | Principe |
|---|---|---|
| Photo depuis l'appareil | `shared/utils/image.ts` | l'image choisie est réduite (1280 px) et recompressée en JPEG dans le navigateur (canvas), puis transformée en texte **base64** (`data:image/jpeg;base64,…`). Ce texte part dans `photoUrl` et est **stocké dans la base** : aucun fichier sur le serveur. Une photo de 3 Mo pèse environ 200 à 350 Ko |
| Suggestions d'adresse | `features/pollutions/services/address.service.ts` | API Adresse de l'État (`environment.addressApiUrl`, gratuite, sans clé, adresses françaises). Le champ Lieu attend une pause de 300 ms (`debounceTime`) puis cherche ; `switchMap` annule la recherche précédente. Une adresse choisie remplit le lieu, la latitude et la longitude |
| Carte | `shared/components/location-map/` | Leaflet + OpenStreetMap. Un clic ou le point déplacé remplit les coordonnées (et le lieu s'il est vide, avec l'adresse la plus proche) ; le point suit aussi les coordonnées saisies. Leaflet n'est téléchargé que sur les pages Signaler et Modifier |

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
