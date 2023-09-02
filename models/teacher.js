'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Teacher.belongsTo(models.User)
    }
  }
  Teacher.init({
    teacherIntroduction: DataTypes.TEXT,
    style: DataTypes.TEXT,
    videoLink: DataTypes.STRING,
    singleCourseDuration: DataTypes.FLOAT,
    availableMon: DataTypes.BOOLEAN,
    availableTues: DataTypes.BOOLEAN,
    availableWed: DataTypes.BOOLEAN,
    availableThurs: DataTypes.BOOLEAN,
    availableFri: DataTypes.BOOLEAN,
    availableSat: DataTypes.BOOLEAN,
    availableSun: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'Teachers',
    underscored: true
  })
  return Teacher
}
