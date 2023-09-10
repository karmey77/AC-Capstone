const ratingServices = require('../../services/rating-services')

const ratingController = {
  postRating: (req, res, next) => {
    ratingServices.postRating(req, (err, data) => {
      if (err) return next(err)
      return res.redirect(`/users/${data.rating.dataValues.UserId}`)
    })
  }
}

module.exports = ratingController
