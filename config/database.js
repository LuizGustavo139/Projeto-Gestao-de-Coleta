const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DB_HOST) {
  // Configuração para Produção (Render + Aiven)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false // Exigido pelo banco na nuvem do Aiven
        }
      }
    }
  );
} else {
  // Configuração para o seu ambiente local (Sua máquina)
  sequelize = new Sequelize('bancodoanderson', 'root', '', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
  });
}

module.exports = sequelize;