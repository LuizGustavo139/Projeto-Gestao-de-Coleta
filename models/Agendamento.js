const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./User');
const PontoColeta = require('./PontoColeta');
const Residuo = require('./Residuo');

const Agendamento = sequelize.define('Agendamento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dataHora: { type: DataTypes.DATE, allowNull: false },
  endereco: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pendente' } 
});


User.hasMany(Agendamento, { onDelete: 'CASCADE' });
Agendamento.belongsTo(User);


PontoColeta.hasMany(Agendamento, { onDelete: 'SET NULL' });
Agendamento.belongsTo(PontoColeta, { as: 'pontoColeta', foreignKey: 'PontoColetaId' });


Residuo.hasMany(Agendamento, { onDelete: 'SET NULL' });
Agendamento.belongsTo(Residuo, { as: 'residuo', foreignKey: 'ResiduoId' });

module.exports = Agendamento;
