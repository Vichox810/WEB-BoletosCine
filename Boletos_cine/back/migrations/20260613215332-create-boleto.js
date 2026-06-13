'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Boletos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      asiento: {
        type: Sequelize.STRING,
        allowNull: false
      },
      FuncionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Funcions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    // Restricción única: no se puede repetir el mismo asiento en la misma función
    await queryInterface.addIndex('Boletos', ['FuncionId', 'asiento'], {
      unique: true,
      name: 'unique_asiento_por_funcion'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Boletos');
  }
};