const { DataTypes, DATE } = require("sequelize");
const sequelize = require("../sequelize");

const Friends = sequelize.define(
  "Friends",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "User",
        key: "userId",
      },
    },
    friendId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "User",
        key: "userId",
      },
    },
    dateAdded: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "Friends",
  }
);

module.exports = Friends;
