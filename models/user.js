"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Like, { foreignKey: "userId" });
      User.hasMany(models.Blog, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      password: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN,
      verifyToken: DataTypes.STRING,
      verifyTokenCreatedAt: DataTypes.DATE,
      forgotToken: DataTypes.STRING,
      forgotTokenCreatedAt: DataTypes.DATE,
      // isAdmin: DataTypes.BOOLEAN,
      bio: DataTypes.STRING,
      // loginTrialCount: DataTypes.SMALLINT,
      // isSuspended: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
    }
  );
  return User;
};
