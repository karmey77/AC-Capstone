'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teachers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      introduction: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      style: {
        allowNull: false,
        type: Sequelize.STRING
      },
      videoLink: {
        allowNull: false,
        type: Sequelize.STRING
      },
      singleCourseDuration: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      availableMon: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      availableTues: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      availableWed: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      availableThurs: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      availableFri: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      availableSat: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      availableSun: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Teachers');
  }
};