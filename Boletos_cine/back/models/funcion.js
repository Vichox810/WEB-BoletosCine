'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Funcion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Funcion.belongsTo(models.Pelicula, { foreignKey: 'PeliculaId' });
      // define association here
    }
  }
  Funcion.init({
    fecha: DataTypes.DATE,
    hora: DataTypes.STRING,
    sala: DataTypes.STRING,
    precio: DataTypes.FLOAT,
    PeliculaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Funcion',
  });
  return Funcion;
};