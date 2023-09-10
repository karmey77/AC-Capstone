const express = require('express')
const router = express.Router()
const upload = require('../../middleware/multer')
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin, authenticatedTeacher, authenticatedNormalUser } = require('../../middleware/api-auth')
const adminController = require('../../controllers/apis/admin-controller')
const userController = require('../../controllers/apis/user-controller')
const registerationController = require('../../controllers/apis/registeration-controller')
// const ratingController = require('../../controllers/apis/admin-controller')
const teacherController = require('../../controllers/apis/teacher-controller')

router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.post('/signup', userController.signUp)

// router.post('/users/score/:id', authenticated, authenticatedNormalUser, userController.postRating)
router.get('/users/teachers/:id', authenticated, authenticatedNormalUser, teacherController.getTeacher)
router.post('/users/teachers/:id', authenticated, registerationController.postRegisteration)
router.get('/users/:id/edit', authenticated, authenticatedNormalUser, userController.editUser)
router.get('/users/:id/apply', authenticated, authenticatedNormalUser, userController.getApply)
router.post('/users/:id/apply', authenticated, authenticatedNormalUser, userController.postApply)
router.get('/users/:id', authenticated, authenticatedNormalUser, userController.getUser)
router.put('/users/:id', authenticated, authenticatedNormalUser, upload.single('image'), userController.putUser)

router.get('/teachers/:id/edit', authenticated, authenticatedTeacher, teacherController.editTeacher)
router.get('/teachers/:id', authenticated, authenticatedTeacher, teacherController.getTeacherFromTeacher)
router.put('/teachers/:id', authenticated, authenticatedTeacher, upload.single('image'), teacherController.putTeacher)

router.get('/', authenticated, authenticatedNormalUser, teacherController.getTeachers)

router.use('/', apiErrorHandler)
module.exports = router
