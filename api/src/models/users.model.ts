import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

/** Rôles possibles : seul un admin voit la liste des utilisateurs. */
export const USER_ROLES = ["utilisateur", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserAttributes {
  id: number;
  login: string;
  password: string; // mot de passe haché, jamais en clair (voir utils/password.ts)
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id" | "role"> {}

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
      },
      // Colonne ajoutée à la main dans pgAdmin. Un nouveau compte est toujours « utilisateur » :
      // on devient admin en changeant la valeur directement dans la base.
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "utilisateur",
        validate: { isIn: [USER_ROLES as unknown as string[]] }
      }
    },
    {
      tableName: "users",
      // Par défaut, les requêtes ne lisent jamais la colonne password
      defaultScope: { attributes: { exclude: ["password"] } },
      scopes: { withPassword: { attributes: { include: ["password"] } } }
    }
  );

  return Users;
}
