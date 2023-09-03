'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Rating.belongsTo(models.User)
      Rating.belongsTo(models.Teacher)
    }
  }
  Rating.init({
    comment: DataTypes.TEXT,
    rating: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Rating',
    tableName: 'Ratings',
    underscored: true
  })
  return Rating
}
