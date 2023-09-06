const { User, Rating, Teacher, Registeration } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { imgurFileHandler } = require('../helpers/file-helpers')
const bcrypt = require('bcryptjs')

const userServices = {
  signUp: (req, cb) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('確認密碼與密碼不相符！')

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(user => {
        req.flash('success_messages', '成功註冊帳號！') // 並顯示成功訊息
        return user
      })
      .then(newUser => cb(null, { newUser }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  getUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [
        { model: Rating },
        { model: Teacher },
        { model: Registeration }
      ]
    })
      .then(async user => {
        if (!user) throw new Error("User didn't exist!")
        delete user.password

        // Registeration
        const registrations = Array.isArray(user.Registerations) ? user.Registerations : [user.Registerations]
        // 使用 Promise.all 等待所有 Teacher.findAll 操作完成
        const teacherPromises = registrations.map(async registration => {
          // 先依據每個註冊資訊搜尋老師
          const teacher = await Teacher.findAll({
            where: { id: registration.TeacherId },
            raw: true
          })
            .then(teacher => {
              return teacher[0]
            })

          // 回到 Users 找老師名字
          teacher.name = await User.findAll({
            where: { id: teacher.UserId },
            raw: true
          })
            .then(user => {
              return user[0].name
            })
          teacher.avartar = await User.findAll({
            where: { id: teacher.UserId },
            raw: true
          })
            .then(user => {
              return user[0].avartar
            })

          const rating = await Rating.findOne({
            where: {
              teacher_id: teacher.id,
              user_id: user.id
            },
            raw: true
          })
          teacher.isRated = !!rating
          teacher.rating = rating || null

          registration.teacher = teacher
        })

        await Promise.all(teacherPromises)
        let newRegisterations = []
        if (user.Registerations.length >= 2) {
          await user.Registerations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          newRegisterations = await user.Registerations.slice(0, 2)
        } else {
          newRegisterations = Array.isArray(user.Registerations) ? user.Registerations : [user.Registerations]
        }
        user.newRegisterations = newRegisterations

        // Lesson history
        const currentDate = new Date()
        const lessonHistory = registrations.filter(lesson => lesson.courseTimeEnd < currentDate)
        user.lessonHistory = lessonHistory

        return user
      })
      .then(user => cb(null, { user }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  editUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      raw: true,
      nest: true
    })
      .then(async user => {
        if (!user) throw new Error("User didn't exist!")
        delete user.password

        return user
      })
      .then(user => cb(null, { user }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  putUser: (req, cb) => {
    const { name, introduction } = req.body
    if (!name) throw new Error('User name is required!')
    const { file } = req // 把檔案取出來
    return Promise.all([ // 非同步處理
      User.findByPk(req.params.id), // 去資料庫查有沒有這個人
      imgurFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([user, filePath]) => { // 以上兩樣事都做完以後
        if (!user) throw new Error("User didn't exist!")
        return user.update({ // 修改這筆資料
          name,
          introduction,
          avartar: filePath || user.image // 如果 filePath 是 Truthy (使用者有上傳新照片) 就用 filePath，是 Falsy (使用者沒有上傳新照片) 就沿用原本資料庫內的值
        })
      })
      .then(user => {
        req.flash('success_messages', '使用者資料編輯成功')
        return user
      })
      .then(user => cb(null, { user }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  getTeachers: (req, cb) => {
    const DEFAULT_LIMIT = 6
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return Teacher.findAndCountAll({
      raw: true,
      nest: true,
      limit,
      offset,
      include: { model: User }
    })
      .then(teachers => {
        const data = teachers.rows.map(r => ({
          ...r,
          teacherIntroduction: r.teacherIntroduction.substring(0, 40) + ' ......'
        }))
        const pagination = getPagination(limit, page, teachers.count)
        return [data, pagination]
      })
      .then(([data, pagination]) => cb(null, {
        teachers: data,
        pagination: pagination
      }))
      .catch(err => cb(err))
  }
}

module.exports = userServices
