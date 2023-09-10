const teacherServices = require('../../services/teacher-services')

const teacherController = {
    getTeachers: (req, res, next) => {
        teacherServices.getTeachers(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
    },
    getTeacher: (req, res, next) => {
        teacherServices.getTeacher(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
    }
  }
  module.exports = teacherController
