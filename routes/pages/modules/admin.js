const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/pages/admin-controller')

router.get('/users', adminController.getUsers)
router.use('/', (req, res) => res.redirect('/admin/users'))

module.exports = router
