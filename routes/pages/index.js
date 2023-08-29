const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const userController = require('../../controllers/pages/user-controller')
const { generalErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')
const admin = require('./modules/admin')
const adminController = require('../../controllers/pages/admin-controller')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.use('/admin/signin', adminController.signInPage)

router.use('/admin', authenticatedAdmin, admin)


router.get('/', authenticated, (req, res) => {
    res.render('index')
})

router.use('/', generalErrorHandler)

module.exports = router
