const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const userController = require('../../controllers/pages/user-controller')
const upload = require('../../middleware/multer')
const admin = require('./modules/admin')
const { generalErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')

router.use('/admin', authenticatedAdmin, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)

router.get('/users/:id/edit', userController.editUser)
router.get('/users/:id', userController.getUser)
// router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', upload.single('image'), userController.putUser)
// router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)


router.get('/', authenticated, (req, res) => {
  res.render('index')
})

router.use('/', generalErrorHandler)

module.exports = router
