const { User, Teacher } = require('../models')

const adminServices = {
  getUsers: (req, cb) => {
    User.findAll({
      raw: true,
      nest: true,
      include: { model: Teacher }
    })
      .then(users => {
        users.forEach(user => {
          user.role = user.isAdmin ? '管理員' : (user.Teacher.id ? '老師' : '學生')
        })
        return cb(null, { users })
      })
      .catch(err => cb(err))
  }
}
module.exports = adminServices
