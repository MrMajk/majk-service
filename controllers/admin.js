const Reservation = require("../models/reservation")
const Table = require("../models/table")
const {Op} = require("sequelize")
const path = require("path");
const fs = require("fs");
const User = require("../models/user");
const {isString} = require("../helper");


exports.addReservation = async (req, res) => {
  const {tableId, start_date, end_date, guest_name, guest_phone} = req.body
  try {
    const response = await Reservation.create({
      tableId, start_date, end_date, guest_name, guest_phone
    })
    res.status(201).json(response)
  } catch {
    res.status(500)
  }
}

exports.addTable = async (req, res) => {
  const {name, seats} = req.body
  try {
    const response = await req.user.createTable({
      name, seats,
      image: req.file?.filename || '',
      userId: req.user.id
    })
    res.status(201).json(response)
  } catch(error) {
    console.log(error)
    res.status(500).json()
  }
}

exports.editTable = async (req, res) => {
  try {
    let finalImage = null
    const {name, seats, image} = req.body
    const table = await Table.findOne({
      where: {
        id: req.params.id
      }
    })
    console.log('RESULT:', table.image && req.file !== undefined && table.image !== req.file)
    console.log(table.image, req.file)
    if(table.image && req.file !== undefined && table.image !== req.file) {
      const uploads = path.join(__dirname, '/', '../uploads', table.image)
      if(fs.existsSync(uploads)) {
        console.log(uploads)
        if(uploads) {
          fs.unlinkSync(uploads)
        }
      }
    } else {
      finalImage = table.image
    }
    console.log('------------------------------------')
    console.log(req.file)
    console.log('------------------------------------')
    const updatedTable = await table.update({
      name, seats, image: finalImage ? finalImage : req.file.filename
    })
    res.status(201).json(updatedTable)
  } catch(error) {
    console.log(error)
    res.status(500).json()
  }
}

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      include: [{
        model: User,
        attributes: ['email', 'nick', 'avatar']
      }],
      order: [['updatedAt', 'DESC']]
    })
    res.status(200).json(tables)
  } catch {
    res.status(500).json()
  }
}

exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id)
    res.status(200).json(table)
  } catch {
    res.status(500).json()
  }
}

exports.removeTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id)
    if(!table) {
      res.status(401).json({
        errors: [{
          message: 'table does not exist'
        }]
      })
    }
    console.log(table.image)
    if(table.image) {
      const uploads = path.join(__dirname, '/', '../uploads', table.image)
      if(fs.existsSync(uploads)) {
        console.log(uploads)
        if(uploads) {
          fs.unlinkSync(uploads)
        }
      }
    }

    await Table.destroy({
      where: {
        id: req.params.id
      }
    })
    res.status(201).json({id: req.params.id})
  } catch(error) {
    res.status(500).json(error)
  }
}

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [{
        model: Table,
        attributes: ['name', 'seats', 'image']
      }],
      order: [['start_date', 'DESC']]
    })
    console.log(reservations)
    res.status(200).json(reservations)
  } catch(e) {
    res.status(500).json(e)
  }
}

exports.removeReservation = async (req, res) => {
  try {
    const {id} = req.params
    const reservation = await Reservation.findByPk(id)
    if (reservation) {
      await reservation.destroy()
    } else {
      res.status(404).json('Reservation not found')
    }
    res.status(200).json({id})
  } catch(e) {
    res.status(500).json(e)
  }
}

exports.checkAvailableTables = async (req, res) => {
  const {start_date, end_date} = req.body
  try {
    const reservationTables = [
      ...(await Reservation.findAll({
        attributes: ['tableId'],
        where: {
          [Op.not]: {
            [Op.or]: [{
              start_date: {
                [Op.gt]: start_date.toString()
              }
            },
              {
                end_date: {
                  [Op.lt]: end_date.toString()
                }
              }]
          }
        }
      })),
    ].map(reservation => reservation.tableId)
    const response = await Table.findAll({
      where: {
        id: {
          [Op.notIn]: reservationTables
        }
      }
    })

    res.status(201).json(response)
  } catch {
    res.json(500)
  }
}

exports.fileFilter = (req, file, cb) => {
  const uploads = path.join(__dirname, '/', '../uploads', table.image)
  console.log(uploads)
  if(fs.existsSync(uploads)) {
    console.log('skipped')
    cb(null, false)
    return
  }

  cb(null, true)
}
