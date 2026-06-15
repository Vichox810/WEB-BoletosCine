// back/models/boleto.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Boleto extends Model {
    static associate(models) {
      Boleto.belongsTo(models.Funcion);
      Boleto.belongsTo(models.User);
    }
  }
  
 Boleto.init({
  asiento: DataTypes.STRING,
  totalPagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  codigoPromo: {
    type: DataTypes.STRING,
    allowNull: true
  },
    FuncionId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Boleto',
  });
  return Boleto;
};