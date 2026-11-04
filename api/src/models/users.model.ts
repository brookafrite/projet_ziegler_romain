import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export interface UserAttributes {
  id: number;
  login: string;
  password: string; // mot de passe haché, jamais en clair (voir utils/password.ts)
  nom: string;
  prenom: string;
  email: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

export default function defineUsers(sequelize: Sequelize, _seq?: typeof Sequelize): UserModel {
  const Users = sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: false,
      // Par défaut, les requêtes ne lisent jamais la colonne password
      defaultScope: { attributes: { exclude: ["password"] } },
      scopes: { withPassword: { attributes: { include: ["password"] } } }
    }
  );

  return Users;
}
