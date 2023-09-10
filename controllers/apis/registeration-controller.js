const registerationServices = require('../../services/registeration-services')

const registerationController = {
  postRegisteration: (req, res, next) => {
    registerationServices.postRegisteration(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = registerationController
