/* eslint-disable no-case-declarations */
const { User, Rating, Teacher, Registeration } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { prettyTime } = require('../helpers/handlebars-helpers')
const helpers = require('../helpers/auth-helpers')
const bcrypt = require('bcryptjs')
const { Op, literal } = require('sequelize') // Import Op and literal

const teacherServices = {
  getTeachers: (req, cb) => {
    const thisUser = helpers.getUser(req)
    delete thisUser.password
    const keyword = req.query.keyword || null
    const DEFAULT_LIMIT = 6
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    // Build the where clause to search for Teachers with associated Users
    const whereClause = keyword
      ? {
          '$User.name$': {
            [Op.and]: [
              literal(`LOWER(User.name) LIKE LOWER('%${keyword}%')`) // Case-insensitive search
            ]
          }
        }
      : {} // Empty where clause if keyword is not provided

    return Teacher.findAndCountAll({
      raw: true,
      nest: true,
      thisUser,
      limit,
      keyword,
      offset,
      include: [{ model: User, where: whereClause }] // Include User with the where clause
    })
      .then(teachers => {
        const data = teachers.rows.map(r => ({
          ...r,
          teacherIntroduction: r.teacherIntroduction.substring(0, 35) + ' ...'
        }))
        const pagination = getPagination(limit, page, teachers.count)
        const itemsWithContext = pagination.pages.map(pageNumber => ({ page: pageNumber, keyword }))
        return [data, pagination, itemsWithContext]
      })
      .then(([data, pagination, itemsWithContext]) => cb(null, {
        teachers: data,
        thisUser: thisUser,
        pagination: pagination,
        paginationWithKeyword: itemsWithContext,
        keyword: keyword
      }))
      .catch(err => cb(err))
  }
}

module.exports = teacherServices
