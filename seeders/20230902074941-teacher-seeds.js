'use strict'
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const usedUserIds = new Set()

    await queryInterface.bulkInsert('Teachers',
      Array.from({ length: 30 }, () => {
        let userId
        do {
          userId = users[Math.floor(Math.random() * users.length)].id
        } while (usedUserIds.has(userId))

        usedUserIds.add(userId)

        return {
          teacher_introduction: faker.lorem.text(),
          style: faker.lorem.text(),
          video_link: faker.internet.url(),
          single_course_duration: Math.random() < 0.5 ? 60 : 30,
          available_mon: Math.random() < 0.5 ? 1 : 0,
          available_tues: Math.random() < 0.5 ? 1 : 0,
          available_wed: Math.random() < 0.5 ? 1 : 0,
          available_thurs: Math.random() < 0.5 ? 1 : 0,
          available_fri: Math.random() < 0.5 ? 1 : 0,
          available_sat: Math.random() < 0.5 ? 1 : 0,
          available_sun: Math.random() < 0.5 ? 1 : 0,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: userId
        }
      })
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Teachers', {})
  }
}
