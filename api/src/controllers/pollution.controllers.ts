import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import db from "../models";
import { PollutionCreationAttributes } from "../models/pollutions.model";

const Pollutions = db.pollutions;

/** Champs que le client a le droit d'envoyer (l'id est attribué par la base). */
function readBody(body: Record<string, unknown>): PollutionCreationAttributes {
  const { titre, type, description, dateObservation, lieu, latitude, longitude, photoUrl } = body;
  return {
    titre, type, description, dateObservation, lieu, latitude, longitude,
    photoUrl: photoUrl || null
  } as PollutionCreationAttributes;
}

function readId(req: Request): number {
  return Number(req.params.id);
}

/** Erreur de validation → 400, toute autre erreur → 500. */
function sendError(res: Response, err: unknown, context: string): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      message: "Données invalides : " + err.errors.map((e) => e.message).join(", ")
    });
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ message: `${context} : ${message}` });
}

/**
 * GET /api/pollutions
 * Récupère la liste de toutes les pollutions depuis la base PostgreSQL.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(data);
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la récupération des pollutions");
  }
};

/**
 * GET /api/pollutions/:id
 * Récupère une pollution par son identifiant.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = readId(req);
  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la récupération de la pollution id=${id}`);
  }
};

/**
 * POST /api/pollutions
 * Crée une pollution et la renvoie avec son nouvel id.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.create(readBody(req.body));
    res.status(201).json(data);
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la création de la pollution");
  }
};

/**
 * PUT /api/pollutions/:id
 * Remplace les données d'une pollution existante.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = readId(req);
  try {
    const pollution = await Pollutions.findByPk(id);
    if (!pollution) {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
      return;
    }
    await pollution.update(readBody(req.body)); // l'id de l'URL fait foi
    res.status(200).json(pollution);
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la modification de la pollution id=${id}`);
  }
};

/**
 * DELETE /api/pollutions/:id
 * Supprime une pollution.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = readId(req);
  try {
    const deleted = await Pollutions.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la suppression de la pollution id=${id}`);
  }
};

export default { getAll, getById, create, update, remove };
