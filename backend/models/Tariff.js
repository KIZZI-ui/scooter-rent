const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tariff = sequelize.define("Tariff", {
  minutePrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7,
  },

  startPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 40,
  },
});

module.exports = Tariff;