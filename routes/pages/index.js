const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const userController = require('../../controllers/pages/user-controller')
const teacherController = require('../../controllers/pages/teacher-controller')
const upload = require('../../middleware/multer')
const admin = require('./modules/admin')
const { generalErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin, authenticatedTeacher } = require('../../middleware/auth')

router.get('/auth/google',
  passport.authenticate('google', {
    scope:
            ['email', 'profile']
  }
  ))

router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/users/login'
  }))

router.use('/admin', authenticatedAdmin, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)

router.post('/users/score/:id', authenticated, userController.postRating)
router.get('/users/teachers/:id', authenticated, teacherController.getTeacher)
router.post('/users/teachers/:id', authenticated, userController.postRegisteration)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id/apply', authenticated, userController.getApply)
router.post('/users/:id/apply', authenticated, userController.postApply)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/teachers/:id/edit', authenticatedTeacher, userController.editTeacher)
router.get('/teachers/:id', authenticatedTeacher, teacherController.getTeacherFromTeacher)
router.put('/teachers/:id', authenticatedTeacher, upload.single('image'), userController.putTeacher)

router.get('/', authenticated, teacherController.getTeachers)

router.use('/', generalErrorHandler)

module.exports = router
