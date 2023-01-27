const {body} = require("express-validator")
const User = require("./models/user")

exports.getErrorFormat = (errors) => {
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({[err.param]: err.msg}))
  return extractedErrors
}

exports.isString = (thing) => {
  return Object.prototype.toString.call(thing) === '[object String]';
}

exports.validation = (method) => {
  switch(method) {
    case 'email': {
      return body('email')
        .notEmpty().withMessage('email is required')
        .isEmail().withMessage('Incorrect email').normalizeEmail()
    }
    case 'isEmailExist': {
      return body('email').custom((value, {req}) => {
        return User.findOne({
          where: {
            email: value
          }
        })
          .then(user => {
            if(user) {
              return Promise.reject('Email already exist')
            }
          })
      })
    }
    case 'password': {
      return body('password')
        .notEmpty().withMessage('password is required')
        .trim()
        .isStrongPassword()
    }
    case 'refreshToken': {
      return body('refresh_token')
        .notEmpty().withMessage('refresh token is required')
    }
    case 'nick': {
      return body('nick')
        .notEmpty().withMessage('nick is required')
    }
  }
}
