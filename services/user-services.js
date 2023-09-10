/* eslint-disable no-case-declarations */
const { User, Rating, Teacher, Registeration } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const helpers = require('../helpers/auth-helpers')
const bcrypt = require('bcryptjs')

// 用來搜尋排名
async function getUserRank (userId) {
  try {
    const user = await User.findByPk(userId) // 根据用户ID查找用户
    if (!user) {
      throw new Error('用户不存在')
    }

    // 查询所有用户的totalLearningTime并按totalLearningTime进行排序
    const ranking = await User.findAll({
      attributes: ['id', 'totalLearningTime'],
      order: [['totalLearningTime', 'DESC']]
    })

    // 查找指定用户在排序后的结果中的索引（排名）
    const userIndex = ranking.findIndex(u => u.id === userId)

    // 用户排名是索引加1，因为数组索引是从0开始的
    const userRank = userIndex + 1

    return userRank
  } catch (error) {
    console.error('获取用户排名时发生错误:', error)
    throw error
  }
}

const userServices = {
  signUp: (req, cb) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('確認密碼與密碼不相符！')

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    return User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        nation: req.body.nation,
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
      nest: true
    })
      .then(async user => {
        if (!user) throw new Error("User didn't exist!")
        delete user.password
        const thisUser = helpers.getUser(req)
        delete thisUser.password
        if (thisUser.dataValues) {
          delete thisUser.dataValues.password
          delete thisUser._previousDataValues.password
        }

        // Registeration
        user.Registerations = await Registeration.findAll({
          where: { user_id: user.id },
          raw: true
        })
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

          if (teacher) {
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
            if (teacher.isRated) {
              teacher.rating = rating.rating || null
            }
            registration.teacher = teacher
          }
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

        // Rank
        user.ranking = await getUserRank(user.id)

        if (user.newRegisterations.length === 0) delete user.newRegisterations
        if (user.lessonHistory.length === 0) delete user.lessonHistory
        return [user, thisUser]
      })
      .then(([user, thisUser]) => cb(null, { user, thisUser }))
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
        const thisUser = helpers.getUser(req)
        delete thisUser.password

        return [user, thisUser]
      })
      .then(([user, thisUser]) => cb(null, {
        user: user,
        thisUser: thisUser
      }))
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
        delete user.dataValues.password
        delete user._previousDataValues.password
        return user
      })
      .then(user => cb(null, { user }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  getApply: (req, cb) => {
    return User.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [
        { model: Teacher }
      ]
    })
      .then(user => {
        if (user.Teacher.id) throw new Error('You are already a teacher!')
        if (!user) throw new Error("User didn't exist!")
        delete user.password
        const thisUser = helpers.getUser(req)
        delete thisUser.password
        if (thisUser.dataValues) {
          delete thisUser.dataValues.password
          delete thisUser._previousDataValues.password
        }
        return [user, thisUser]
      })
      .then(([user, thisUser]) => cb(null, {
        user: user,
        thisUser: thisUser
      }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  postApply: (req, cb) => {
    if (!req.body.teacherIntroduction) throw new Error('Teacher introduction is required!')
    if (!req.body.style) throw new Error('Style is required!')
    if (!req.body.singleCourseDuration) throw new Error('Single course duration is required!')
    if (!req.body.videoLink) throw new Error('Video link is required!')

    // 確認資料裡面沒有一樣的 UserId，若有，就建立一個 Error 物件並拋出
    return Teacher.findOne({ where: { UserId: req.params.id } })
      .then(teahcer => {
        if (teahcer) throw new Error('You are already a teacher!')
        return teahcer
      })
      .then(teahcer => Teacher.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        teacherIntroduction: req.body.teacherIntroduction,
        style: req.body.style,
        videoLink: req.body.videoLink,
        singleCourseDuration: req.body.singleCourseDuration,
        availableMon: req.body.availableMon === 'on',
        availableTues: req.body.availableTues === 'on',
        availableWed: req.body.availableWed === 'on',
        availableThurs: req.body.availableThurs === 'on',
        availableFri: req.body.availableFri === 'on',
        availableSat: req.body.availableSat === 'on',
        availableSun: req.body.availableSun === 'on',
        UserId: req.params.id
      }))
      .then(user => {
        req.flash('success_messages', '成功申請成為老師！') // 並顯示成功訊息
        return user
      })
      .then(teacher => cb(null, { teacher }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  }
}

module.exports = userServices
