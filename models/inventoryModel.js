const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Inventory = sequelize.define(
  "Inventory",
  {
    inventoryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    goldCoins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tournamentTickets: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    otherItems: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    tableName: "Inventory",
    timestamps: false,
  }
);

module.exports = Inventory;
