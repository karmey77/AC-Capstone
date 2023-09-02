'use strict'

const bcrypt = require('bcryptjs')
const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: bcrypt.hashSync(SEED_USER.password, bcrypt.genSaltSync(10), null),
      is_admin: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
      .then(() => queryInterface.bulkInsert('Users',
        Array.from({ length: 50 }).map((_, i) =>
          ({
            name: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
            is_admin: 0,
            created_at: new Date(),
            updated_at: new Date()
          })
        ), {}))
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Teachers', null, {})
      .then(() => queryInterface.bulkDelete('Users', null, {}))
  }
}
