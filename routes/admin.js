const express = require('express')
const router = express.Router()
const adminController = require ('../controllers/admin')
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

router.get('/check-available-tables', adminController.checkAvailableTables)
router.post('/add-reservation', [
  validation('required','start_date'),
  validation('required','end_date'),
  validation('required','guest_name'),
  validation('required','guest_phone'),
  validation('required','tableId')
], adminController.addReservation)
router.get('/reservations', adminController.getReservations)
router.delete('/reservation/:id', adminController.removeReservation)

router.post('/add-table',upload.single('image'), [
  validation('required','name'),
  validation('required','seats')
], adminController.addTable)
router.get('/tables', adminController.getTables)
router.delete('/table/:id', adminController.removeTable)
router.get('/table/:id', adminController.getTableById)
router.put('/table/:id', upload.single('image'), adminController.editTable)

module.exports = router
