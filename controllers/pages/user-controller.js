const userServices = require('../../services/user-services')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.session.createdData = data
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.render('users/profile', data))
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) => err ? next(err) : res.render('users/edit', data))
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) => err
      ? next(err)
      : res.redirect(`/users/${req.params.id}`))
  },
  getApply: (req, res, next) => {
    userServices.getApply(req, (err, data) => err ? next(err) : res.render('users/apply-teacher', data))
  },
  postApply: (req, res, next) => {
    userServices.postApply(req, (err, data) => {
      if (err) return next(err)
      req.session.createdData = data
      return res.redirect(`/teachers/${req.session.createdData.teacher.dataValues.id}`)
    })
  }
}

module.exports = userController
