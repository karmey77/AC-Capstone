'use strict'

const bcrypt = require('bcryptjs')
const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      name: SEED_USER.name,
      email: SEED_USER.email,
      avartar: `https://robohash.org/user${SEED_USER.name}.png?size=400x400`,
      nation: faker.address.countryCode('alpha-2'), // faker 8.0 後改成 location
      introduction: faker.lorem.text(),
      password: bcrypt.hashSync(SEED_USER.password, bcrypt.genSaltSync(10), null),
      is_admin: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
      .then(() => queryInterface.bulkInsert('Users',
        Array.from({ length: 100 }).map((_, i) =>
          ({
            name: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
            avartar: `https://robohash.org/user${i + 1}.png?size=400x400`,
            introduction: faker.lorem.text(),
            nation: faker.address.countryCode('alpha-2'),
            is_admin: 0,
            created_at: new Date(),
            updated_at: new Date()
          })
        ), {}))
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
