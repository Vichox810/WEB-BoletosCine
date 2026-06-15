'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Promocions', [{
      codigo: 'FRUTILLAR',
      descuento: 10,
      descripcion: '10% de descuento en tu compra',
      activa: true,
      usosMaximos: 100,
      usosActuales: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      codigo: 'BIENVENIDO',
      descuento: 20,
      descripcion: '20% de descuento para nuevos usuarios',
      activa: true,
      usosMaximos: 50,
      usosActuales: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Promocions', null, {});
  }
};
