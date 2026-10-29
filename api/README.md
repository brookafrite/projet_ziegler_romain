# API Pollution

API REST en Node.js / Express / TypeScript, branchée sur une base PostgreSQL avec l'ORM Sequelize.

```
src/
├── index.ts                       démarrage du serveur, CORS, création de la table et données initiales
├── config.ts                      paramètres de connexion à la base (variables d'environnement)
├── seed.ts                        pollutions insérées au premier démarrage
├── models/
│   ├── index.ts                   connexion Sequelize à PostgreSQL
│   └── pollutions.model.ts        table « pollution »
├── controllers/
│   └── pollution.controllers.ts   logique de chaque route (findAll, findByPk, create, update, destroy)
└── routes/
    ├── index.ts                   enregistre toutes les routes
    └── pollution.routes.ts        URL → contrôleur
```

## Routes

| Méthode | Route                 | Rôle                          | Réponse            |
|---------|-----------------------|-------------------------------|--------------------|
| GET     | `/health`             | Vérifie que le serveur répond | 200                |
| GET     | `/api/pollutions`     | Liste des pollutions          | 200                |
| GET     | `/api/pollutions/:id` | Détail d'une pollution        | 200, 404           |
| POST    | `/api/pollutions`     | Création                      | 201, 400           |
| PUT     | `/api/pollutions/:id` | Modification                  | 200, 400, 404      |
| DELETE  | `/api/pollutions/:id` | Suppression                   | 204, 404           |

Un id non numérique (`/api/pollutions/abc`) renvoie 400.

## Table `pollution`

| Colonne           | Type      | Obligatoire |
|-------------------|-----------|-------------|
| `id`              | integer   | clé primaire, auto-incrémentée |
| `titre`           | varchar(100) | oui |
| `type`            | varchar   | oui (Plastique, Chimique, Dépôt sauvage, Eau, Air, Autre) |
| `description`     | text      | oui |
| `dateObservation` | date      | oui |
| `lieu`            | varchar   | oui |
| `latitude`        | float     | oui (-90 à 90) |
| `longitude`       | float     | oui (-180 à 180) |
| `photoUrl`        | text      | non |

La table est créée automatiquement au démarrage (`sequelize.sync()`), puis remplie avec `seed.ts` si elle est vide.

## Déploiement sur Render

Le fichier `render.yaml`, à la racine du dépôt, est un **Blueprint** : il décrit en une fois
les trois services du projet, et Render les crée tous d'un coup.

| Service          | Type             | Rôle                                              |
|------------------|------------------|---------------------------------------------------|
| `pollution-db`   | PostgreSQL       | la base de données (table `pollution`)            |
| `pollution-api`  | Web Service Node | cette API, dossier `api/`                         |
| `pollution-front`| Static Site      | le site Angular, dossier `Front/`                 |

### Étapes

1. **Pousser le code sur GitHub.** Render lit le dépôt GitHub, pas l'ordinateur : le dossier
   `api/` et `render.yaml` doivent être poussés sur la branche à déployer.
2. Sur <https://dashboard.render.com> : **New → Blueprint**.
3. Choisir le dépôt `projet_ziegler_romain`, puis la **branche** (`ex03`, ou `main` une fois la PR fusionnée).
4. Render affiche les trois services trouvés dans `render.yaml` : cliquer sur **Apply** (ou **Deploy Blueprint**).
5. Attendre la fin des déploiements (quelques minutes). Render crée d'abord la base, puis :
   - l'API : `npm install --include=dev && npm run build`, puis `npm run start` ;
   - le Front : `npm install && npm run build`.

   Render transmet l'adresse de la base à l'API dans la variable `DATABASE_URL` : aucun mot de
   passe n'est à recopier.
6. Vérifier les journaux de `pollution-api` (onglet **Logs**). On doit y lire `Synced db.`
   (table créée), puis le message d'insertion des données initiales.

### Tester l'API GET pollution

L'adresse de l'API est affichée en haut de la page du service `pollution-api`
(par exemple `https://pollution-api-cplq.onrender.com`). Ouvrir dans le navigateur :

- `https://<adresse-de-l-api>/health` → `{"status":"OK"}`
- `https://<adresse-de-l-api>/api/pollutions` → la liste des pollutions en JSON
- `https://<adresse-de-l-api>/api/pollutions/1` → une seule pollution

### Relier le Front à l'API

Le Front appelle l'adresse écrite dans `Front/src/environments/environment.ts` (`apiUrl`),
ici `https://pollution-api-cplq.onrender.com/api`. Render ajoute un suffixe (`-cplq`) quand le
nom est déjà pris : si l'adresse de l'API change, la recopier dans `apiUrl` (en gardant `/api`
à la fin), committer et pousser. Render redéploie le Front tout seul.

### Si le Blueprint échoue

- **« free database limit »** : le plan gratuit n'autorise qu'**une** base PostgreSQL gratuite
  par compte. Supprimer l'ancienne base (Dashboard → la base → Settings → Delete) ou
  réutiliser l'existante (voir la méthode manuelle).
- **Dossier introuvable (`rootDir`)** : la branche choisie ne contient pas encore `api/` ou
  la version corrigée de `render.yaml` : pousser, puis relancer (**Manual Sync**).
- **Un site statique créé à la main existe déjà** : il peut rester, ou être supprimé au profit
  de `pollution-front`.

### Méthode manuelle (sans Blueprint)

1. **New → PostgreSQL** : nom `pollution-db`, plan Free → Create. Copier son **Internal Database URL**.
2. **New → Web Service** : le dépôt et la branche, puis
   - Root Directory : `api`
   - Build Command : `npm install --include=dev && npm run build`
   - Start Command : `npm run start`
   - Health Check Path : `/health`
   - Variable d'environnement : `DATABASE_URL` = l'Internal Database URL copiée
3. Tester comme ci-dessus, puis relier le Front.

### À savoir (plan gratuit)

- L'API **s'endort** après 15 minutes sans visite : la première requête peut prendre
  près d'une minute, le temps qu'elle redémarre. L'ouvrir avant une présentation.
- La base gratuite **expire au bout de 30 jours** : il faut alors en recréer une.

## Lancer l'API sur son ordinateur

Il n'y a pas de PostgreSQL sur l'ordinateur : l'API locale se connecte à la base **Render**.

1. Sur Render, ouvrir la base `pollution-db` → **Connect** → copier l'**External Database URL**.
2. Dans `api/`, copier `.env.example` en `.env` et y coller l'adresse après `DATABASE_URL=`.
   `.env` contient le mot de passe : il est ignoré par Git et ne doit jamais être commité.
3. Lancer :

   ```bash
   npm install
   npm run dev
   ```

   On doit lire `Synced db.`. Sans `.env`, l'API démarre mais affiche
   `Failed to sync db: SequelizeConnectionRefusedError ECONNREFUSED` : elle ne trouve pas de base.
4. Tester : <http://localhost:3000/api/pollutions>, puis le Front avec `npm start` dans `Front/`.

## Variables d'environnement

L'API lit la connexion à la base dans `DATABASE_URL`
(`postgres://utilisateur:motdepasse@hote:5432/base`), fournie par Render. À défaut, elle utilise
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` et `DB_NAME` (valeurs par défaut dans `config.ts`).
Aucun mot de passe n'est écrit dans le code, car le dépôt est public.

## Côté Front

Le Front appelle cette API pour les pollutions (`Front/src/environments/environment*.ts`,
`mockApi.pollutions: false`). L'inscription (`/api/auth/signup`) reste simulée dans le
navigateur (`mockApi.auth: true`) tant qu'elle n'existe pas dans l'API.
