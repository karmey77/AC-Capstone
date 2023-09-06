'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      avartar: {
        allowNull: true,
        type: Sequelize.STRING
      },
      introduction: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      is_admin: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: 0
      },
      nation: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'TW'
      },
      total_learning_time: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
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
    await queryInterface.dropTable('Users')
  }
}
