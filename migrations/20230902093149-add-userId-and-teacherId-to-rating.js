'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Ratings', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    })
      .then(() => {
        queryInterface.addColumn('Ratings', 'teacher_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Teachers',
            key: 'id'
          }
        })
      })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Ratings', 'user_id')
      .then(() => {
        queryInterface.removeColumn('Ratings', 'teacher_id')
      })
  }
}
