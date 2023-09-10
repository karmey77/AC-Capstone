const ratingServices = require('../../services/rating-services')

const ratingController = {
  postRating: (req, res, next) => {
    ratingServices.postRegisteration(req, (err, data) => {
      if (err) return next(err)
      console.log(data.registration)
      req.session.createdData = data
      return res.redirect(`/users/teachers/${data.registration.dataValues.TeacherId}`)
    })
  }
}

module.exports = ratingController
