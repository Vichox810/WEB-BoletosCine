'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Promocions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      descuento: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      activa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      usosMaximos: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      usosActuales: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Promocions');
  }
};
