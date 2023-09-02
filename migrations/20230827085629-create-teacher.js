'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Teachers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teacher_introduction: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      style: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      video_link: {
        allowNull: false,
        type: Sequelize.STRING
      },
      single_course_duration: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      available_mon: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      available_tues: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      available_wed: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      available_thurs: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      available_fri: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      available_sat: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      available_sun: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Teachers')
  }
}
