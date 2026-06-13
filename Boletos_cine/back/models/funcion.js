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
    fecha: DataTypes.DATE,
    hora: DataTypes.STRING,
    sala: DataTypes.STRING,
    precio: DataTypes.FLOAT,
    PeliculaId: DataTypes.INTEGER,
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activa'
    }
  }, {
    sequelize,
    modelName: 'Funcion',
  });
  return Funcion;
};