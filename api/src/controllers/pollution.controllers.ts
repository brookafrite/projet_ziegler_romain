import { Request, Response } from "express";
import db from "../models";
import { PollutionCreationAttributes } from "../models/pollutions.model";
import { sendError } from "../utils/http";

const Pollutions = db.pollutions;

/** Champs que le client a le droit d'envoyer (l'id est attribué par la base). */
function readBody(body: Record<string, unknown>): PollutionCreationAttributes {
  const { titre, type, description, dateObservation, lieu, latitude, longitude, photoUrl, indice } = body;
  return {
    titre, type, description, dateObservation, lieu, latitude, longitude,
    photoUrl: photoUrl || null,
    indice: indice ?? null
  } as PollutionCreationAttributes;
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
  const id = Number(req.params.id);
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
  const id = Number(req.params.id);
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
  const id = Number(req.params.id);
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
