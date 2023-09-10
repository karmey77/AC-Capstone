const { User, Teacher } = require('../models')
const helpers = require('../helpers/auth-helpers')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const adminServices = {
  getUsers: (req, cb) => {
    const DEFAULT_LIMIT = 10
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return User.findAndCountAll({
      raw: true,
      nest: true,
      limit,
      offset,
      include: { model: Teacher }
    })
      .then(users => {
        const data = users.rows.map(r => ({
          ...r,
          role: r.isAdmin ? '管理員' : (r.Teacher.id ? '老師' : '學生')
        }))
        const thisUser = helpers.getUser(req)
        if (thisUser) {
          delete thisUser.password
        }

        return cb(null, {
          users: data,
          thisUser: thisUser,
          pagination: getPagination(limit, page, users.count)
        })
      })
      .catch(err => cb(err))
  }
}
module.exports = adminServices
