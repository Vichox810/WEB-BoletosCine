'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pelicula extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pelicula.hasMany(models.Funcion, { foreignKey: 'PeliculaId' });
      // define association here
    }
  }
  Pelicula.init({
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'El título es requerido' } }
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'El género es requerido' } }
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'La duración debe ser un número entero' },
        min: { args: [1], msg: 'La duración debe ser mayor a 0' }
      }
    },
    sinopsis: DataTypes.STRING,
    imagen: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pelicula',
  });
  return Pelicula;
};