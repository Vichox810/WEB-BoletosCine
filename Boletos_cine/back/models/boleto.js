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
    grupoCompra: {
      type: DataTypes.STRING,
      allowNull: true
    },
    asiento: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El asiento es requerido' },
      is: { args: /^\d+$/, msg: 'El asiento debe ser un número' }
    }
  },
  totalPagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'El total pagado no puede ser negativo' }
    }
  },
  codigoPromo: {
    type: DataTypes.STRING,
    allowNull: true
  },
    FuncionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'ID de función inválido' },
        min: { args: [1], msg: 'ID de función inválido' }
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'ID de usuario inválido' },
        min: { args: [1], msg: 'ID de usuario inválido' }
      }
    }
  }, {
    sequelize,
    modelName: 'Boleto',
  });
  return Boleto;
};