'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Promocion extends Model {
    static associate(models) {
    }
  }

  Promocion.init({
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'El código de promoción ya existe' },
      validate: { notEmpty: { msg: 'El código es requerido' } }
    },
    descuento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'El descuento debe ser un número entero' },
        min: { args: [1], msg: 'El descuento debe ser al menos 1' },
        max: { args: [100], msg: 'El descuento no puede superar 100' }
      }
    },
    descripcion: DataTypes.STRING,
    expiresAt: DataTypes.DATE,
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    usosMaximos: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    usosActuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Promocion',
  });

  return Promocion;
};
