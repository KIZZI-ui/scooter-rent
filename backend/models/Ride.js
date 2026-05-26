const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ride = sequelize.define("Ride", {
  scooterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

userId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  cost: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "finished",
  },
});

module.exports = Ride;

module.exports = Ride;