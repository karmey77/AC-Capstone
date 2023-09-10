/* eslint-disable no-case-declarations */
const { User, Rating, Teacher, Registeration } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { imgurFileHandler } = require('../helpers/file-helpers')
const helpers = require('../helpers/auth-helpers')
const { Op, literal } = require('sequelize') // Import Op and literal

// 用來產生所有可以的上課時間
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
          teacherIntroduction: r.teacherIntroduction.substring(0, 35) + ' ...',
          User: {
            ...r.User,
            password: null
          }
        }))
        const thisUser = helpers.getUser(req)
        delete thisUser.password
        if (thisUser.dataValues) {
          delete thisUser.dataValues.password
          delete thisUser._previousDataValues.password
        }
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
        if (thisUser.dataValues) {
          delete thisUser.dataValues.password
          delete thisUser._previousDataValues.password
        }
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
        if (thisUser.dataValues) {
          delete thisUser.dataValues.password
          delete thisUser._previousDataValues.password
        }
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
  }
}

module.exports = teacherServices
