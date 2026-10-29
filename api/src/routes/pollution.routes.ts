import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";

export default (app: Application): void => {
  const router = Router();

  // Vérifie le paramètre :id avant chaque route qui l'utilise (ex. /api/pollutions/abc → 400)
  router.param("id", (_req, res, next, id) => {
    if (!/^\d+$/.test(id)) {
      res.status(400).json({ message: `Identifiant invalide : ${id}.` });
      return;
    }
    next();
  });

  // Route GET /api/pollutions
  router.get("/", pollutionController.getAll);

  // Route GET /api/pollutions/:id
  router.get("/:id", pollutionController.getById);

  // Route POST /api/pollutions
  router.post("/", pollutionController.create);

  // Route PUT /api/pollutions/:id
  router.put("/:id", pollutionController.update);

  // Route DELETE /api/pollutions/:id
  router.delete("/:id", pollutionController.remove);

  // Exposition sous /api/pollutions et /api/pollution (singulier et pluriel)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
