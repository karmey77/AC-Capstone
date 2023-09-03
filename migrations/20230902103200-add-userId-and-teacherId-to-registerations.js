'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('Registerations', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    })
      .then(() => {
        queryInterface.addColumn('Registerations', 'teacher_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Teachers',
            key: 'id'
          }
        })
      })
  },
  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Registerations', 'user_id')
      .then(() => {
        queryInterface.removeColumn('Registerations', 'teacher_id')
      })
  }
}
