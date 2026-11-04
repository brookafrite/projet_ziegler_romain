import { Application, Router } from "express";
import userController from "../controllers/user.controllers";

export default (app: Application): void => {
  const router = Router();

  // Vérifie le paramètre :id avant chaque route qui l'utilise (ex. /api/users/abc → 400)
  router.param("id", (_req, res, next, id) => {
    if (!/^\d+$/.test(id)) {
      res.status(400).json({ message: `Identifiant invalide : ${id}.` });
      return;
    }
    next();
  });

  // Route POST /api/users/login (authentification fictive)
  router.post("/login", userController.login);

  // Route GET /api/users
  router.get("/", userController.getAll);

  // Route GET /api/users/:id
  router.get("/:id", userController.getById);

  // Route POST /api/users
  router.post("/", userController.create);

  // Route DELETE /api/users/:id
  router.delete("/:id", userController.remove);

  app.use("/api/users", router);
};
