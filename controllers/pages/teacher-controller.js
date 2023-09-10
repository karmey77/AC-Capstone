const teacherServices = require('../../services/teacher-services')

const teacherController = {
  getTeachers: (req, res, next) => {
    teacherServices.getTeachers(req, (err, data) => err ? next(err) : res.render('index', data))
  },
  getTeacher: (req, res, next) => {
    teacherServices.getTeacher(req, (err, data) => {
      if (err) return next(err)
      res.render('users/teacher-profile', data)
    })
  },
  getTeacherFromTeacher: (req, res, next) => {
    teacherServices.getTeacher(req, (err, data) => err ? next(err) : res.render('teachers/profile', data))
  },
  editTeacher: (req, res, next) => {
    teacherServices.editTeacher(req, (err, data) => err ? next(err) : res.render('teachers/edit', data))
  },
  putTeacher: (req, res, next) => {
    teacherServices.putTeacher(req, (err, data) => err
      ? next(err)
      : res.redirect(`/teachers/${req.params.id}`))
  }
}
module.exports = teacherController
