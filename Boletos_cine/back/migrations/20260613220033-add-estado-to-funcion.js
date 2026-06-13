'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Funcions', 'estado', {
      type: Sequelize.STRING,
      defaultValue: 'activa'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Funcions', 'estado');
  }
};