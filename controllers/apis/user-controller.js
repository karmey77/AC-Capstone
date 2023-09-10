const jwt = require('jsonwebtoken')
const userServices = require('../../services/user-services')

const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 簽發 JWT，效期為 30 天
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) => err
      ? next(err)
      : res.json({ status: 'success', data }))
  },
  getApply: (req, res, next) => {
    userServices.getApply(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postApply: (req, res, next) => {
    userServices.postApply(req, (err, data) => err
      ? next(err)
      : res.json({ status: 'success', data }))
  }
}
module.exports = userController
