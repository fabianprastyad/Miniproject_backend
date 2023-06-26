"use strict";
const { Model, VIRTUAL } = require("sequelize");
const { convertFromDBtoRealPath } = require("../utils/file");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.User, { foreignKey: "userId" });
      Blog.hasMany(models.Like, { foreignKey: "blogId" });
    }
  }
  Blog.init(
    {
      title: DataTypes.STRING,
      userId: DataTypes.SMALLINT,
      content: DataTypes.STRING,
      Categories: DataTypes.ENUM(
        "Umum",
        "Olahraga",
        "Bisnis",
        "Ekonomi",
        "Politik",
        "Fiksi"
      ),

      imageURL: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("imageURL");
          if (rawValue) {
            return convertFromDBtoRealPath(rawValue);
          }
          return null;
        },
        vidioURL: DataTypes.STRING,
        country: DataTypes.STRING,
        keywords: DataTypes.STRING,
        total_Like: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Blog",
      timestamps: true,
    }
  );
  return Blog;
};
