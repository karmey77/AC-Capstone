'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Registeration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Registeration.belongsTo(models.User)
      Registeration.belongsTo(models.Teacher)
    }
  }
  Registeration.init({
    courseTimeStart: DataTypes.DATE,
    courseTimeEnd: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Registeration',
    tableName: 'Registerations',
    underscored: true
  })
  return Registeration
}
