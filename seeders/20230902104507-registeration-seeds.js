'use strict'

const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    function generateRandomTime () {
      // Generate random hours between 18 and 20 (inclusive)
      let randomHours = Math.floor(Math.random() * 3) + 18

      // Generate random minutes between 0 or 30
      let randomMinutes = Math.random() < 0.5 ? 0 : 30

      // Format the hours and minutes as a time string
      const formattedTimeStart = `${randomHours.toString().padStart(2, '0')}:${randomMinutes.toString().padStart(2, '0')}`

      const period = Math.random() < 0.5 ? 30 : 60
      switch (period) {
        case 60:
          randomHours += 1
          break
        case 30:
          randomMinutes += 30
          break
      }

      if (randomMinutes === 60) {
        randomMinutes = 0
        randomHours += 1
      }

      const formattedTimeEnd = `${randomHours.toString().padStart(2, '0')}:${randomMinutes.toString().padStart(2, '0')}`

      return [formattedTimeStart, formattedTimeEnd]
    }

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

    await queryInterface.bulkInsert('Registerations',
      Array.from({ length: filteredUsers.length * 3 }, () => {
        // Generate a random date within 14 days into the future from '2020-01-01'
        const futureDate = faker.date.soon()

        // Generate a random time
        const [randomTimeStart, randomTimeEnd] = generateRandomTime()

        // Combine the date and time into a SQL-compatible datetime string
        const courseTimeStart = `${futureDate.getFullYear()}-${futureDate.getMonth()}-${futureDate.getDate()} ${randomTimeStart}:00`
        const courseTimeEnd = `${futureDate.getFullYear()}-${futureDate.getMonth()}-${futureDate.getDate()} ${randomTimeEnd}:00`

        return {
          course_time_start: courseTimeStart,
          course_time_end: courseTimeEnd,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: filteredUsers[Math.floor(Math.random() * filteredUsers.length)].id,
          teacher_id: teachers[Math.floor(Math.random() * teachers.length)].id
        }
      })
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Registerations', {})
  }
}
