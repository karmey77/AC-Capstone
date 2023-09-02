'use strict'

// const bcrypt = require('bcryptjs')
// const SEED_USER = {
//   name: 'root',
//   email: 'root@example.com',
//   password: '12345678'
// }

// account: user1, email: user1@example.com, password: 12345678

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
}
