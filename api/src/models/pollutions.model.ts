import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

// Mêmes types que dans le Front (Front/src/app/features/pollutions/models/pollution.model.ts)
export const POLLUTION_TYPES = ["Plastique", "Chimique", "Dépôt sauvage", "Eau", "Air", "Autre"];

/** Adresse d'une image en ligne (http/https), ou photo envoyée en base64 (stockée dans la base). */
const PHOTO_PATTERN = /^(https?:\/\/\S+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/;

export interface PollutionAttributes {
  id: number;
  titre: string;
  type: string;
  description: string;
  dateObservation: string; // format AAAA-MM-JJ
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl?: string | null;
  indice?: number | null; // indice de dangerosité, null = non évalué
  auteurId?: number | null; // utilisateur qui a publié la pollution, null = auteur inconnu
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "photoUrl" | "indice" | "auteurId"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

export default function definePollutions(
  sequelize: Sequelize,
  _seq?: typeof Sequelize
): PollutionModel {
  const Pollutions = sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      titre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [POLLUTION_TYPES] }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
      },
      dateObservation: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      lieu: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: -90, max: 90 }
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: -180, max: 180 }
      },
      // Adresse d'une image, ou la photo elle-même en base64 (« data:image/jpeg;base64,… ») :
      // TEXT accepte un texte de grande taille, l'image est donc stockée dans la base.
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: { is: { args: PHOTO_PATTERN, msg: "photo invalide (adresse http(s) ou image base64)" } }
      },
      // Colonne ajoutée à la main dans pgAdmin (sync() ne modifie pas une table existante)
      indice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { isInt: true, min: 0 }
      },
      // Colonne ajoutée à la main dans pgAdmin : clé étrangère vers users.id.
      // Si le compte est supprimé, la pollution reste mais perd son auteur (SET NULL).
      auteurId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL"
      }
    },
    { tableName: "pollution" }
  );

  return Pollutions;
}
