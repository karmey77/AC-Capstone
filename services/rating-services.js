/* eslint-disable no-case-declarations */
const { Teacher, Rating } = require('../models')
const helpers = require('../helpers/auth-helpers')

const ratingServices = {
  postRating: async (req, cb) => {
    const thisUser = helpers.getUser(req)
    const rated = await Rating.findAll({
      where: { teacher_id: req.params.id, user_id: thisUser.id },
      raw: true,
      nest: true
    })

    return Teacher.findByPk(req.params.id, {
      raw: true,
      nest: true,
      thisUser,
      rated
    })
      .then(async teacher => {
        if (rated.length > 0) throw new Error('You have rated this teacher!')
        if (!teacher) throw new Error("Teacher didn't exist!")

        // 在 Rating 輸入資料
        const result = await Rating.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
          comment: req.body.comment,
          rating: req.body.rating,
          UserId: thisUser.id,
          TeacherId: req.params.id
        })
        return result
      })
      .then(rating => {
        req.flash('success_messages', '成功評分')
        return rating
      })
      .then(rating => cb(null, { rating }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  }
}

module.exports = ratingServices
