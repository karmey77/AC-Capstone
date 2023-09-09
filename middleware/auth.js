const helpers = require('../helpers/auth-helpers')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      res.redirect('/admin')
    } else if (helpers.getUser(req).Teacher) {
      res.redirect(`/teachers/${helpers.getUser(req).Teacher.id}`)
    }
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}
const authenticatedTeacher = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    const isTeacher = !!helpers.getUser(req).Teacher
    if (isTeacher) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin,
  authenticatedTeacher
}
