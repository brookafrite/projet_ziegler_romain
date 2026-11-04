import { NextFunction, Request, Response } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";

/** Vérifie le paramètre :id d'une route (ex. /api/pollutions/abc → 400). */
export function checkId(_req: Request, res: Response, next: NextFunction, id: string): void {
  if (!/^\d+$/.test(id)) {
    res.status(400).json({ message: `Identifiant invalide : ${id}.` });
    return;
  }
  next();
}

/** Valeur déjà prise (login, email...) → 409, données invalides → 400, le reste → 500. */
export function sendError(res: Response, err: unknown, context: string): void {
  if (err instanceof UniqueConstraintError) {
    res.status(409).json({ message: "Ce login ou cet email est déjà utilisé." });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({
      message: "Données invalides : " + err.errors.map((e) => e.message).join(", ")
    });
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ message: `${context} : ${message}` });
}
