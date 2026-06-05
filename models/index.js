const sequelize = require('../../config/database');
const User = require('./User');
const PontoColeta = require('./PontoColeta');
const Residuo = require('./Residuo');
const Agendamento = require('./Agendamento');

module.exports = { sequelize, User, PontoColeta, Residuo, Agendamento };