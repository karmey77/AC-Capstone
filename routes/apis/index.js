const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
// const { authenticated } = require('../../middleware/auth')
const adminController = require('../../controllers/apis/admin-controller')
const userController = require('../../controllers/apis/user-controller')

router.get('/admin/users', adminController.getUsers)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// router.post('/signup', userController.signUp)

// router.use('/admin', authenticated, authenticatedAdmin, admin)
// router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
// router.get('/restaurants/:id', authenticated, restController.getRestaurant)
// router.get('/restaurants', authenticated, restController.getRestaurants)
// router.use('/', apiErrorHandler)
module.exports = router
