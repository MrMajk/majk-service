const {body} = require("express-validator")
const User = require("./models/user")

exports.isObject = value => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

exports.isString = value => {
  return Object.prototype.toString.call(value) === '[object String]';
}

exports.getErrorFormat = (errors) => {
  const extractedErrors = []
  try {
    if(this.isString(errors)) {
      extractedErrors.push({
        error: errors
      })
    }

    if(errors.errors && Array.isArray(errors.errors)) {
      errors.array().map(err => extractedErrors.push({[err.param]: err.msg}))
    }
    return {errors: extractedErrors}
  } catch(e) {
    return {
      errors: [{
        error: 'Global error'
      }]
    }
  }
}

exports.validation = (method, name) => {
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
    case 'required': {
      return body(name)
        .notEmpty().withMessage(`${name} is required`)
    }
  }
}
