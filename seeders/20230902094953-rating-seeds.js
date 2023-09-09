'use strict'
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const teachers = await queryInterface.sequelize.query(
      'SELECT id, user_id FROM Teachers;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    // Filter out users who are also teachers
    const filteredUsers = users.filter(user => !teachers.some(teacher => teacher.user_id === user.id))

    await queryInterface.bulkInsert('Ratings',
      Array.from({ length: 60 }, () => {
        return {
          comment: faker.lorem.sentences(),
          rating: Math.floor(Math.random() * 5) + 1,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: filteredUsers[Math.floor(Math.random() * filteredUsers.length)].id,
          teacher_id: teachers[Math.floor(Math.random() * teachers.length)].id
        }
      })
    )
  },
  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Ratings', {})
  }
}
