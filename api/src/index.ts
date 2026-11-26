import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import db from "./models";
import initRoutes from "./routes";
import { POLLUTIONS_SEED } from "./seed";

const app: Application = express();

// CORS : autorise le Front (hébergé sur une autre adresse) à appeler l'API.
// Par défaut, cors() accepte toutes les origines et les méthodes GET, POST, PUT, DELETE...
app.use(cors());

// Lit le corps JSON des requêtes (req.body), envoyé par HttpClient côté Angular.
// Limite relevée à 2 Mo (100 Ko par défaut) : une photo peut être envoyée en base64.
// Le Front la réduit et la compresse avant (quelques centaines de Ko).
app.use(express.json({ limit: "2mb" }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Requête trop lourde (photo au-delà de 2 Mo) : un message clair en JSON plutôt qu'une page d'erreur
app.use((err: { type?: string }, _req: Request, res: Response, next: NextFunction) => {
  if (err.type === "entity.too.large") {
    res.status(413).json({ message: "La photo est trop lourde (2 Mo au maximum)." });
    return;
  }
  next(err);
});

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate(POLLUTIONS_SEED);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    // Une connexion refusée a un message vide : on affiche aussi le code de la cause (ex. ECONNREFUSED)
    const cause = (err as { parent?: { code?: string } }).parent?.code;
    console.log(`Failed to sync db: ${err.name} ${err.message} ${cause ?? ""}`.trim());
    console.log("Vérifier DATABASE_URL (fichier api/.env en local, voir api/README.md).");
  });

initRoutes(app);

// set port, listen on 0.0.0.0 for Render and container environments
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
