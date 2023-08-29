const { Restaurant, User, Category } = require('../../models')
// const { imgurFileHandler } = require('../../helpers/file-helpers')
const adminServices = require('../../services/admin-services')

const adminController = {
    getUsers: (req, res, next) => {
        adminServices.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', data))
    },
    signInPage: (req, res) => {
        res.render('./admin/signin')
    },
    signIn: (req, res, next) => {
        req.flash('success_messages', '管理員成功登入！')
        res.redirect('/')
    },
    logout: (req, res) => {
        req.flash('success_messages', '管理員登出成功！')
        req.logout()
        res.redirect('/admin/signin')
    }
}

module.exports = adminController
