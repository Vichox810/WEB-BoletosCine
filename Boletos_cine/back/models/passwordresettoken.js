'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      PasswordResetToken.belongsTo(models.User);
    }
  }
  PasswordResetToken.init({
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    UserId: DataTypes.INTEGER,
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PasswordResetToken',
  });
  return PasswordResetToken;
};