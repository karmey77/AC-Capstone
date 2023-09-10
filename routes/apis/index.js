const express = require('express')
const router = express.Router()
const upload = require('../../middleware/multer')
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin, authenticatedTeacher, authenticatedNormalUser } = require('../../middleware/api-auth')
const adminController = require('../../controllers/apis/admin-controller')
const userController = require('../../controllers/apis/user-controller')
const teacherController = require('../../controllers/apis/teacher-controller')

router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.post('/signup', userController.signUp)

// router.post('/users/score/:id', authenticated, userController.postRating)
router.get('/users/teachers/:id', authenticated, authenticatedNormalUser, teacherController.getTeacher)
// router.post('/users/teachers/:id', authenticated, userController.postRegisteration)
router.get('/users/:id/edit', authenticated, authenticatedNormalUser, userController.editUser)
// router.get('/users/:id/apply', authenticated, userController.getApply)
// router.post('/users/:id/apply', authenticated, userController.postApply)
router.get('/users/:id', authenticated, authenticatedNormalUser, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

// router.get('/teachers/:id/edit', authenticatedTeacher, userController.editTeacher)
// router.get('/teachers/:id', authenticatedTeacher, userController.getTeacherFromTeacher)
// router.put('/teachers/:id', authenticatedTeacher, upload.single('image'), userController.putTeacher)

router.get('/', authenticated, authenticatedNormalUser, teacherController.getTeachers)

router.use('/', apiErrorHandler)
module.exports = router
