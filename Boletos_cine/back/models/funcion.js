'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Funcion extends Model {
    static associate(models) {
      Funcion.belongsTo(models.Pelicula, { foreignKey: 'PeliculaId' });
      Funcion.hasMany(models.Boleto);
    }
  }
  Funcion.init({
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La fecha es requerida' },
        isDate: { msg: 'Fecha inválida' }
      }
    },
    hora: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La hora es requerida' },
        is: { args: /^([01]\d|2[0-3]):([0-5]\d)$/, msg: 'Formato de hora inválido (HH:MM)' }
      }
    },
    sala: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La sala es requerida' }
      }
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'El precio debe ser un número' },
        min: { args: [1], msg: 'El precio debe ser mayor a 0' }
      }
    },
    PeliculaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'ID de película inválido' },
        min: { args: [1], msg: 'ID de película inválido' }
      }
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activa',
      validate: {
        isIn: { args: [['activa', 'cancelada']], msg: 'Estado debe ser activa o cancelada' }
      }
    },
    limiteAsientos: {
      type: DataTypes.INTEGER,
      defaultValue: 40,
      validate: {
        isInt: { msg: 'El límite de asientos debe ser entero' },
        min: { args: [1], msg: 'Debe haber al menos 1 asiento' },
        max: { args: [200], msg: 'El límite máximo es 200 asientos' }
      }
    }
  }, {
    sequelize,
    modelName: 'Funcion',
  });
  return Funcion;
};