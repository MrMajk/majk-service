const express = require('express')
const authController = require("../controllers/auth");
const {validation} = require("../helper");
const multer = require("multer");
const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'avatars/')
  },
  filename: function (req, file, cb) {
    const extImage = file.mimetype.split("/")[1]
    cb(null, file.fieldname + Date.now() + '.' + extImage)
  }
})

const upload = multer({storage: storage})


router.post('/signup', upload.single('avatar'), [
  validation('email'),
  validation('isEmailExist'),
  validation('password'),
  validation('nick')
], authController.signup)

router.post('/login', [
  validation('email'),
  validation('password')
  ],
  authController.login)

router.get('/check-token', authController.verifyAccessToken)
router.post('/revoke-token', [
  validation('refreshToken')
], authController.revokeToken)
router.get('/user', authController.getUserByToken)
module.exports = router
