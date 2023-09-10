const passport = require('../config/passport') // 引入 passport

const authenticated = passport.authenticate('jwt', { session: false })
const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied: you are not admin!' })
}
const authenticatedTeacher = (req, res, next) => {
  const isTeacher = !!req.user.Teacher
  if (req.user && isTeacher) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied: you are not teacher!' })
}

const authenticatedNormalUser = (req, res, next) => {
  const isTeacher = !!req.user.Teacher
  if (!req.user.isAdmin && !isTeacher) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied: you are not student!' })
}

module.exports = {
  authenticated,
  authenticatedAdmin,
  authenticatedTeacher,
  authenticatedNormalUser
}
