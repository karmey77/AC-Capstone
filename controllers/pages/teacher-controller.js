const teacherServices = require('../../services/teacher-services')

const teacherController = {
  getTeachers: (req, res, next) => {
    teacherServices.getTeachers(req, (err, data) => err ? next(err) : res.render('index', data))
  }
}
module.exports = teacherController
