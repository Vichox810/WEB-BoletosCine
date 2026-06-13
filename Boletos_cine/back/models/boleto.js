'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Boleto extends Model {
    static associate(models) {
      Boleto.belongsTo(models.Funcion);
      Boleto.belongsTo(models.User);
    }
  }
  Boleto.init({
    asiento: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'El asiento es requerido' } }
    },
    FuncionId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Boleto',
  });
  return Boleto;
};