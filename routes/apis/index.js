const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin, authenticatedTeacher, authenticatedNormalUser } = require('../../middleware/api-auth')
const adminController = require('../../controllers/apis/admin-controller')
const userController = require('../../controllers/apis/user-controller')

router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.post('/signup', userController.signUp)

router.get('/', authenticated, authenticatedNormalUser, userController.getTeachers)

router.use('/', apiErrorHandler)
module.exports = router
