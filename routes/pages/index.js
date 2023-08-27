const express = require('express')
const router = express.Router()
const userController = require('../../controllers/pages/user-controller')
const { generalErrorHandler } = require('../../middleware/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

// router.get('/signin', userController.signInPage)
// router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.use('/', generalErrorHandler)

module.exports = router
