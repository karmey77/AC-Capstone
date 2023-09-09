const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const passportJWT = require('passport-jwt')
const { User, Teacher } = require('../models')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email: email } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
          return cb(null, user)
        })
      })
  }
))

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
function (accessToken, refreshToken, profile, cb) {
  const { name, email, picture, locale } = profile._json
  User.findOne({ where: { email: email } })
    .then(user => {
      if (user) return cb(null, user)
      const randomPassword = Math.random().toString(36).slice(-8)
      bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(randomPassword, salt))
        .then(hash => User.create({
          name,
          email,
          nation: locale.slice(-2),
          avartar: picture,
          password: hash
        }))
        .then(user => cb(null, user))
        .catch(err => cb(err, false))
    })
}
))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(new JWTStrategy(jwtOptions, (jwtPayload, cb) => {
  User.findByPk(jwtPayload.id, {
    include: [
      { model: Teacher }
    ]
  })
    .then(user => cb(null, user))
    .catch(err => cb(err))
}))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: Teacher }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
