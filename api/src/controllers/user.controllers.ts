import { Request, Response } from "express";
import db from "../models";
import { UserInstance } from "../models/users.model";
import { hashPassword, verifyPassword } from "../utils/password";
import { sendError } from "../utils/http";

const Users = db.users;

/** Ce que l'API renvoie d'un utilisateur : tout sauf le mot de passe. */
function toPublic(user: UserInstance) {
  const { id, login, nom, prenom, email } = user;
  return { id, login, nom, prenom, email };
}

/**
 * GET /api/users
 * Liste des utilisateurs (sans les mots de passe).
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Users.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(data.map(toPublic));
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la récupération des utilisateurs");
  }
};

/**
 * GET /api/users/:id
 * Détail d'un utilisateur.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const user = await Users.findByPk(id);
    if (user) {
      res.status(200).json(toPublic(user));
    } else {
      res.status(404).json({ message: `Aucun utilisateur trouvé avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la récupération de l'utilisateur id=${id}`);
  }
};

/**
 * POST /api/users
 * Crée un utilisateur. Le mot de passe est haché avant d'être enregistré.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const { login, password, nom, prenom, email } = req.body;
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    return;
  }
  try {
    const user = await Users.create({ login, password: hashPassword(password), nom, prenom, email });
    res.status(201).json(toPublic(user));
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la création de l'utilisateur");
  }
};

/**
 * DELETE /api/users/:id
 * Supprime un utilisateur.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const deleted = await Users.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: `Aucun utilisateur trouvé avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la suppression de l'utilisateur id=${id}`);
  }
};

/**
 * POST /api/users/login
 * Authentification fictive : vérifie le login et le mot de passe, puis renvoie
 * l'utilisateur. Aucun jeton n'est créé, le Front garde simplement l'utilisateur connecté.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { login, password } = req.body;
  if (typeof login !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Login et mot de passe obligatoires." });
    return;
  }
  try {
    const user = await Users.scope("withPassword").findOne({ where: { login } });
    if (!user || !verifyPassword(password, user.password)) {
      res.status(401).json({ message: "Login ou mot de passe incorrect." });
      return;
    }
    res.status(200).json(toPublic(user));
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la connexion");
  }
};

export default { getAll, getById, create, remove, login };
