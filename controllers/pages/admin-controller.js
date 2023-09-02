const { Restaurant, User, Category } = require('../../models')
const adminServices = require('../../services/admin-services')

const adminController = {
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) => err ? next(err) : res.render('admin-users', data))
  }
}

module.exports = adminController
