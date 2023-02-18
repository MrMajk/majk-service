const User = require("../models/user");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {validationResult} = require("express-validator");
const {getErrorFormat} = require("../helper");
require('dotenv').config()

const createAccessToken = (userId) => {
  return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '60m'})
}

const createRefreshToken = (userId) => {
  return jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '10d'})
}

exports.signup = async (req, res) => {
  try {
    const {email, password, nick} = req.body

    const errors = validationResult(req)
    const hashedPassword = await bcrypt.hash(password, 12)

    if(!errors.isEmpty()) {
      return res.status(401).json(getErrorFormat(errors))
    }

    const response = await User.create({
      email,
      nick,
      avatar: req.file.filename,
      password: hashedPassword
    })
    res.status(201).json(response)
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(401).json(getErrorFormat(errors))
    }

    const user = await User.findOne({
      where: {
        email
      }
    })
    if(!user) {
      return res.status(401).json({
        errors: [{
          message: 'Auth error'
        }]
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(isPasswordValid) {
      const access_token = createAccessToken(user.id)
      const refresh_token = createRefreshToken(user.id)
      res.cookie('access_token', access_token, {secure: true, maxAge: 2 * 60 * 60 * 1000})
      res.cookie('refresh_token', refresh_token, {secure: true, maxAge: 96 * 60 * 60 * 1000})
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email
        },
        refresh_token,
        access_token
      })
    } else {
      res.status(401).json(getErrorFormat('Login error'))
    }
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.verifyAccessToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if(token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        res.status(200).json(decoded)
      } catch(e) {
        res.status(401).json(getErrorFormat('Invalid token'))
      }
    } else {
      res.status(500).json({
        errors: [{
          message: 'General error'
        }]
      })
    }
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.revokeToken = (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(401).json(getErrorFormat(errors))
  }

  const {refresh_token} = req.body
  try {
    const data = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)
    const new_access_token = createAccessToken(data.userId)
    const new_refresh_token = createRefreshToken(data.userId)
    res.cookie('access_token', new_access_token, {secure: true, maxAge: 2 * 60 * 60 * 1000})
    res.cookie('refresh_token', new_refresh_token, {secure: true, maxAge: 96 * 60 * 60 * 1000})
    res.json({
      message: 'Revoke success'
    })
  } catch(e) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.getUserByToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(decoded && decoded.userId) {
      const user = await User.findOne({
        where: {
          id: decoded.userId
        }
      })
      res.json(user)
    }
    res.status(404).json(getErrorFormat('User not found'))
  } catch(error) {
    res.status(500).json(error)
  }
}

exports.checkRole = async (req, res, next) => {
  try {
    if(process.env.EDIT_ROLES.split(", ").includes(req.user.role)) {
      next()
    } else {
      res.status(401).json(getErrorFormat('You dont have permission'))
    }
  } catch(e) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}
