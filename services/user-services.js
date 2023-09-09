/* eslint-disable no-case-declarations */
const { User, Rating, Teacher, Registeration } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { imgurFileHandler } = require('../helpers/file-helpers')
const { prettyTime } = require('../helpers/handlebars-helpers')
const helpers = require('../helpers/auth-helpers')
const bcrypt = require('bcryptjs')
const { Op, literal } = require('sequelize') // Import Op and literal

function generateAllSessions (period) {
  const output = []

  for (let i = 18; i < 22; i++) {
    let hours = i
    const possibleMin = [0, 30]

    possibleMin.forEach(ele => {
      let mins = ele
      const formattedTimeStart = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

      switch (period) {
        case 60:
          const nextHour = hours + 1
          if (nextHour <= 22) {
            const formattedTimeEnd = `${nextHour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
            if (`${nextHour}${mins}` !== '2230') {
              output.push({ startTime: formattedTimeStart, endTime: formattedTimeEnd })
            }
          }
          break
        case 30:
          mins += 30
          if (mins === 60) {
            mins = 0
            hours += 1
          }
          const formattedTimeEnd = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
          output.push({ startTime: formattedTimeStart, endTime: formattedTimeEnd })
          break
      }
    })
  }
  return output
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

        if (!user.newRegisterations[0].id) delete user.newRegisterations
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
        return user
      })
      .then(user => cb(null, { user }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
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
  },
  getTeacher: (req, cb) => {
    return Teacher.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [
        { model: User }
      ]
    })
      .then(async teacher => {
        if (!teacher) throw new Error("Teacher didn't exist!")
        delete teacher.User.password
        const thisUser = helpers.getUser(req)
        delete thisUser.password
        thisUser.registration = await Registeration.findAll({
          where: { user_id: thisUser.id },
          raw: true
        })

        teacher.Ratings = await Rating.findAll({
          where: { teacher_id: teacher.id },
          raw: true
        })
        teacher.Ratings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        teacher.Registeration = await Registeration.findAll({
          where: { teacher_id: teacher.id },
          raw: true,
          nest: true,
          include: [
            { model: User }
          ]
        })

        // // All ratings
        const ratings = Array.isArray(teacher.Ratings) ? teacher.Ratings : [teacher.Ratings]
        // teacher.ratings = ratings

        // Mean rating
        // Calculate the sum of all ratings
        const totalRatings = ratings.length
        let sumOfRatings = 0
        for (const rating of ratings) {
          sumOfRatings += rating.rating
        }
        // Calculate the mean (average) rating
        teacher.meanRating = Math.round(sumOfRatings / totalRatings * 100) / 100

        // Course time
        // Get the current date in Taipei time (UTC+8)
        const taipeiTimeZoneOffset = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
        const todayInTaipei = new Date(Date.now() + taipeiTimeZoneOffset)

        // Initialize an array to store the available dates for the next 14 days
        const availableDates = []

        // Loop through the next 14 days, starting from tomorrow
        for (let i = 1; i <= 14; i++) {
          // Calculate the date for the current day
          const currentDate = new Date(todayInTaipei)
          currentDate.setDate(todayInTaipei.getDate() + i)

          // Check if the current day is available
          const dayName = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'][currentDate.getUTCDay()]

          if (teacher[`available${dayName}`]) {
            availableDates.push(currentDate.toISOString().slice(0, 10))
          }
        }
        // Generate all course options
        const timeSlots = generateAllSessions(teacher.singleCourseDuration)
        // Define the timezone offset for Taipei (UTC+8)
        const taipeiTimeZoneOffsetMinutes = 8 * 60
        // Initialize an array to store the expanded schedule
        const expandedSchedule = []
        // Loop through each available date and time slot to create combinations
        for (const date of availableDates) {
          for (const timeSlot of timeSlots) {
            const startDate = new Date(`${date}T${timeSlot.startTime}:00`)
            const endDate = new Date(`${date}T${timeSlot.endTime}:00`)
            // Adjust times to Taipei timezone
            startDate.setMinutes(startDate.getMinutes() + taipeiTimeZoneOffsetMinutes)
            endDate.setMinutes(endDate.getMinutes() + taipeiTimeZoneOffsetMinutes)

            expandedSchedule.push({
              startTime: startDate,
              endTime: endDate
            })
          }
        }

        // Filter with existing registerations
        // Function to check if two time intervals overlap
        function doTimeIntervalsOverlap (interval1Start, interval1End, interval2Start, interval2End) {
          return (
            (interval1Start <= interval2Start && interval1End >= interval2Start) ||
            (interval1Start <= interval2End && interval1End >= interval2End) ||
            (interval2Start <= interval1Start && interval2End >= interval1Start) ||
            (interval2Start <= interval1End && interval2End >= interval1End)
          )
        }

        // Filter available course options
        const thisUserRegistrations = Array.isArray(thisUser.registration) ? thisUser.registration : [thisUser.registration]
        const registrations = Array.isArray(teacher.Registeration) ? teacher.Registeration : [teacher.Registeration]
        const availableCourseOptions = expandedSchedule.filter(option => {
          // Check if this option overlaps with any registration
          const overlap = registrations.some(registration => {
            return doTimeIntervalsOverlap(
              new Date(option.startTime).getTime(),
              new Date(option.endTime).getTime(),
              new Date(registration.courseTimeStart).getTime(),
              new Date(registration.courseTimeEnd).getTime()
            )
          })

          // Return true for options that don't overlap with any registration
          return !overlap
        })
          .filter(option => {
          // Check if this option overlaps with any of this user's registration
            const overlap = thisUserRegistrations.some(registration => {
              return doTimeIntervalsOverlap(
                new Date(option.startTime).getTime(),
                new Date(option.endTime).getTime(),
                new Date(registration.courseTimeStart).getTime(),
                new Date(registration.courseTimeEnd).getTime()
              )
            })

            // Return true for options that don't overlap with any of this user's registration
            return !overlap
          })

        teacher.courseOptions = availableCourseOptions

        let newRegisterations = []
        if (teacher.Registeration.length >= 2) {
          await teacher.Registeration.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          newRegisterations = await teacher.Registeration.slice(0, 4)
        } else {
          newRegisterations = Array.isArray(teacher.Registeration) ? teacher.Registeration : [teacher.Registeration]
        }
        teacher.newRegisterations = newRegisterations

        return [teacher, thisUser]
      })
      .then(([teacher, thisUser]) => cb(null, {
        teacher: teacher,
        thisUser: thisUser
      }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  editTeacher: (req, cb) => {
    return Teacher.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [
        { model: User }
      ]
    })
      .then(async teacher => {
        if (!teacher) throw new Error("Teacher didn't exist!")
        delete teacher.User.password
        const thisUser = helpers.getUser(req)
        delete thisUser.password
        return [teacher, thisUser]
      })
      .then(([teacher, thisUser]) => cb(null, {
        teacher: teacher,
        thisUser: thisUser
      }))
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  putTeacher: (req, cb) => {
    const { name, teacherIntroduction, style, singleCourseDuration, videoLink } = req.body
    if (!name) throw new Error('User name is required!')
    if (!teacherIntroduction) throw new Error('Teacher introduction is required!')
    if (!style) throw new Error('Style is required!')
    if (!singleCourseDuration) throw new Error('Single course duration is required!')
    if (!videoLink) throw new Error('Video link is required!')

    const { file } = req // 把檔案取出來

    return Promise.all([ // 非同步處理
      Teacher.findByPk(req.params.id), // 去資料庫查有沒有這個老師
      imgurFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(async ([teacher, filePath]) => { // 以上兩樣事都做完以後
        if (!teacher) throw new Error("Teacher didn't exist!")

        await User.findByPk(teacher.UserId, {
          name,
          filePath
        })
          .then(user => {
            user.update({
              name,
              avartar: filePath || user.image
            })
          })

        return teacher.update({ // 修改這筆資料
          teacherIntroduction,
          style,
          singleCourseDuration,
          videoLink,
          availableMon: req.body.availableMon === 'on',
          availableTues: req.body.availableTues === 'on',
          availableWed: req.body.availableWed === 'on',
          availableThurs: req.body.availableThurs === 'on',
          availableFri: req.body.availableFri === 'on',
          availableSat: req.body.availableSat === 'on',
          availableSun: req.body.availableSun === 'on'
        })
      })
      .then(teacher => {
        req.flash('success_messages', '老師資料編輯成功')
        return teacher
      })
      .then(teacher => cb(null, { teacher }))
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
  },
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
  },
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

module.exports = userServices
