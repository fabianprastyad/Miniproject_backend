"use strict";

const { ENUM } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Blogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      userId: {
        type: Sequelize.SMALLINT,
        references: {
          model: "Users",
          key: "id",
        },
      },
      title: {
        type: Sequelize.STRING(150),
        defaultValue: null,
      },
      content: {
        type: Sequelize.STRING(150),
        defaultValue: null,
      },
      imageURL: {
        type: Sequelize.STRING(150),
        defaultValue: null,
      },
      Categories: {
        type: Sequelize.ENUM(
          "Umum",
          "Olahraga",
          "Bisnis",
          "Ekonomi",
          "Politik",
          "Fiksi"
        ),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        type: Sequelize.DATE,
      },
      vidioURL: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      keywords: {
        type: Sequelize.STRING,
      },
      total_Like: {
        type: Sequelize.INTEGER,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Blogs");
  },
};
