const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Residuo = sequelize.define('Residuo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomeResiduo: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Residuo;
