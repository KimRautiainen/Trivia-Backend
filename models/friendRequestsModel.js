const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); 

const FriendRequests = sequelize.define(
  "FriendRequests",
  {
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "User",
        key: "userId",
      },
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "User",
        key: "userId",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    dateRequested: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dateResponded: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
    tableName: "FriendRequests",
  }
);

module.exports = FriendRequests;
