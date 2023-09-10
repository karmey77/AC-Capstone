const registerationServices = require('../../services/registeration-services')

const registerationController = {
  postRegisteration: (req, res, next) => {
    registerationServices.postRegisteration(req, (err, data) => {
      if (err) return next(err)
      console.log(data.registration)
      req.session.createdData = data
      return res.redirect(`/users/teachers/${data.registration.dataValues.TeacherId}`)
    })
  }
}

module.exports = registerationController
