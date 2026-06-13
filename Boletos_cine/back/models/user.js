'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
 class User extends Model {
  static associate(models) {
    User.hasMany(models.Boleto);
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre es requerido' } }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'El email ya está registrado' },
      validate: { isEmail: { msg: 'Email inválido' } }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [8, 100], msg: 'La contraseña debe tener al menos 8 caracteres' }
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });

  return User;
};