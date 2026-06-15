'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Funcions', 'limiteAsientos', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 40
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Funcions', 'limiteAsientos');
  }
};
