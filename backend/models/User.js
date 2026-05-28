const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },

  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 300,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },

  blockReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  isOnline: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

lastSeenAt: {
  type: DataTypes.DATE,
  allowNull: true,
},

});

module.exports = User;