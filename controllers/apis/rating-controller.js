const ratingServices = require('../../services/rating-services')

const ratingController = {
  postRating: (req, res, next) => {
    ratingServices.postRating(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = ratingController
