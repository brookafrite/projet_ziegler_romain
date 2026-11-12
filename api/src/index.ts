import express, { Application, Request, Response } from "express";
import cors from "cors";
import db from "./models";
import initRoutes from "./routes";
import { POLLUTIONS_SEED } from "./seed";

const app: Application = express();

// CORS : autorise le Front (hébergé sur une autre adresse) à appeler l'API.
// Par défaut, cors() accepte toutes les origines et les méthodes GET, POST, PUT, DELETE...
app.use(cors());

// Lit le corps JSON des requêtes (req.body), envoyé par HttpClient côté Angular
app.use(express.json());

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
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
