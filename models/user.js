'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      User.hasOne(models.Teacher)
      User.hasMany(models.Rating)
      User.hasMany(models.Registeration)
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN, // 一定要加！
    introduction: DataTypes.TEXT,
    totalLearningTime: DataTypes.FLOAT,
    password: DataTypes.STRING,
    avartar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true
  })
  return User
}
