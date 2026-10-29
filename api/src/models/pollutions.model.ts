import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

// Mêmes types que dans le Front (Front/src/app/pollution/models/pollution.model.ts)
export const POLLUTION_TYPES = ["Plastique", "Chimique", "Dépôt sauvage", "Eau", "Air", "Autre"];

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
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "photoUrl"> {}

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
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: "pollution",
      freezeTableName: true,
      timestamps: false
    }
  );

  return Pollutions;
}
