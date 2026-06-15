'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash('12345678', 10)
    await queryInterface.bulkInsert('Users', [
      { name: 'Admin', email: 'admin@test.com', password: hash, role: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Usuario', email: 'user@test.com', password: hash, role: 'user', createdAt: new Date(), updatedAt: new Date() },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
