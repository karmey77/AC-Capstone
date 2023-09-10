/* eslint-disable no-case-declarations */
const { User, Teacher, Registeration } = require('../models')
const { prettyTime } = require('../helpers/handlebars-helpers')
const helpers = require('../helpers/auth-helpers')

const registerationServices = {
  postRegisteration: (req, cb) => {
    const thisUser = helpers.getUser(req)
    return Teacher.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [
        { model: User }
      ],
      thisUser
    })
      .then(async teacher => {
        if (!teacher) throw new Error("Teacher didn't exist!")
        const startTime = new Date(req.body.coursetime)
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + teacher.singleCourseDuration)

        // 在 Registeration 輸入資料
        const result = await Registeration.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
          courseTimeStart: startTime,
          courseTimeEnd: endTime,
          UserId: thisUser.id,
          TeacherId: teacher.id
        })

        // 在 User update totalLearningTime
        await User.increment('totalLearningTime', { by: teacher.singleCourseDuration, where: { id: thisUser.id } })

        return [result, startTime, endTime, teacher.User.name, teacher.videoLink]
      })
      .then(([registration, startTime, endTime, teacherName, teacherVideoLink]) => {
        const message = {}
        message.startTime = prettyTime(startTime)
        message.endTime = prettyTime(endTime)
        message.teacherName = teacherName
        message.teacherVideoLink = teacherVideoLink
        req.flash('register_messages', message)
        return registration
      })
      .then(registration => cb(null, { registration }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  }
}

module.exports = registerationServices
