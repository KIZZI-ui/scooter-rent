const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Scooter = sequelize.define("Scooter", {
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  charge: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "available",
  },

  reservedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Scooter;