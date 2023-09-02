const { User, Teacher } = require('../models')

const adminServices = {
    getUsers: (req, cb) => {
        User.findAll({

            raw: true,
            nest: true
            // include: [Teacher]
        })
            .then(users => {
                return cb(null, { users })
            })
            .catch(err => cb(err))
    }
}
module.exports = adminServices
