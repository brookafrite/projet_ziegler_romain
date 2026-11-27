import { Request, Response } from "express";
import db from "../models";
import { POLLUTION_STATUTS, PollutionCreationAttributes, PollutionStatut } from "../models/pollutions.model";
import { sendError } from "../utils/http";

const Pollutions = db.pollutions;

/**
 * Avec chaque pollution, on renvoie son auteur grâce à l'association (models/index.ts),
 * mais seulement son id, son prénom et son nom : jamais son email ni son mot de passe.
 */
const withAuteur = {
  include: [{ model: db.users, as: "auteur", attributes: ["id", "prenom", "nom"] }]
};

/**
 * Champs que le client a le droit d'envoyer (l'id est attribué par la base).
 * L'auteur n'en fait pas partie : il est fixé à la création et ne change plus ensuite.
 * Le statut non plus : il a sa propre route (PATCH /:id/statut), une nouvelle pollution est « signalee ».
 */
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
    const data = await Pollutions.findAll({ ...withAuteur, order: [["id", "ASC"]] });
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
    const data = await Pollutions.findByPk(id, withAuteur);
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
 * Crée une pollution et la renvoie avec son nouvel id et son auteur.
 * Authentification fictive : l'auteur est l'auteurId envoyé par le Front (l'utilisateur connecté).
 * Avec le jeton JWT (prochain TP), l'API le lira dans le jeton au lieu de faire confiance à la requête.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await Pollutions.create({ ...readBody(req.body), auteurId: req.body.auteurId ?? null });
    const data = await Pollutions.findByPk(created.id, withAuteur);
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
    await pollution.update(readBody(req.body)); // l'id de l'URL fait foi, l'auteur ne change pas
    await pollution.reload(withAuteur);
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

/**
 * PATCH /api/pollutions/:id/statut
 * Change l'avancement du traitement : { "statut": "signalee" | "en-cours" | "nettoyee" }.
 * Passer à « nettoyee » note la date du jour ; revenir en arrière l'efface.
 * Réservé aux admins dans le Front ; l'API le vérifiera avec le jeton JWT (prochain TP).
 */
export const updateStatut = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const statut = req.body?.statut as PollutionStatut;
  if (!POLLUTION_STATUTS.includes(statut)) {
    res.status(400).json({ message: `Statut invalide : attendu ${POLLUTION_STATUTS.join(", ")}.` });
    return;
  }
  try {
    const pollution = await Pollutions.findByPk(id);
    if (!pollution) {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
      return;
    }
    const today = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
    await pollution.update({ statut, dateNettoyage: statut === "nettoyee" ? today : null });
    await pollution.reload(withAuteur);
    res.status(200).json(pollution);
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors du changement de statut de la pollution id=${id}`);
  }
};

export default { getAll, getById, create, update, remove, updateStatut };
