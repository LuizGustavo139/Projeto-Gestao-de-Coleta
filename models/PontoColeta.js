const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PontoColeta = sequelize.define('PontoColeta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomePonto: { type: DataTypes.STRING, allowNull: false },
  endereco: { type: DataTypes.STRING, allowNull: false },
  residuosAceitos: { type: DataTypes.STRING, allowNull: false } 
});

module.exports = PontoColeta;
