const { Restaurant, User, Category } = require('../../models')
const adminServices = require('../../services/admin-services')

const adminController = {
    getUsers: (req, res, next) => {
        adminServices.getUsers(req, (err, data) => err ? next(err) : res.render('./admin/users', data))
    },
    signInPage: (req, res) => {
        console.log('this is admin signin page')
        res.render('./admin/signin')
    },
    signIn: (req, res, next) => {
        console.log('this is admin')
        req.flash('success_messages', '管理員成功登入！')
        res.redirect('/admin/users')
    },
    logout: (req, res) => {
        req.flash('success_messages', '管理員登出成功！')
        req.logout()
        res.redirect('/admin/signin')
    }
}

module.exports = adminController
