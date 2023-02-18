const express = require('express')
const router = express.Router()
const tableController = require ('../controllers/admin/table')
const reservationController = require ('../controllers/admin/reservation')
const authController = require ('../controllers/auth')
const mealController = require ('../controllers/admin/meal')
const multer = require('multer')
const path = require("path");
const fs = require("fs");
const {validation} = require("../helper");

const fileFilter = (req, file, cb) => {
  const uploads = path.join(__dirname, '/', '../uploads', file.originalname)
  if(fs.existsSync(uploads)) {
    cb(null, false)
    return
  }
  cb(null, true)
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const extImage = file.mimetype.split("/")[1]
    cb(null, file.fieldname + Date.now() + '.' + extImage)
  }
})

const upload = multer({
  fileFilter,
  storage
})

router.get('/check-available-tables', tableController.checkAvailableTables)

// RESERVATION
router.post('/add-reservation', [
  validation('required','start_date'),
  validation('required','end_date'),
  validation('required','guest_name'),
  validation('required','guest_phone'),
  validation('required','tableId')
], reservationController.addReservation)
router.get('/reservations', reservationController.getReservations)
router.delete('/reservation/:id', reservationController.removeReservation)

// TABLE
router.post('/add-table', authController.checkRole, upload.single('image'), [
  validation('required','name'),
  validation('required','seats')
], tableController.addTable)
router.get('/tables', tableController.getTables)
router.delete('/table/:id', authController.checkRole, tableController.removeTable)
router.get('/table/:id', tableController.getTableById)
router.put('/table/:id', upload.single('image'), authController.checkRole, tableController.editTable)

// MEAL
router.get('/meals', mealController.getMeals)
router.post('/add-meal', authController.checkRole, upload.single('image'), [
  validation('required','name'),
  validation('required','description'),
  validation('required','price')
], mealController.addMeal)
router.put('/meal/:id', authController.checkRole, upload.single('image'), mealController.editMeal)
router.get('/meal/:id', mealController.getMealById)
router.delete('/meal/:id', authController.checkRole, mealController.removeMeal)

module.exports = router
