const Reservation = require("../models/reservation")
const Table = require("../models/table")
const {Op} = require("sequelize")
const path = require("path");
const fs = require("fs");
const User = require("../models/user");
const {validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const {getErrorFormat} = require("../helper");


exports.addReservation = async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(401).json(getErrorFormat(errors))
  }

  const {tableId, start_date, end_date, guest_name, guest_phone} = req.body
  try {
    const existReservation = await Reservation.findOne({
      where: {
        [Op.and]: [
          {
            start_date
          },
          {
            end_date
          },
          {
            tableId
          }
        ]
      }
    })
    if (existReservation) {
      res.status(401).json(getErrorFormat('Table already booked on this date'))
    }
    const response = await Reservation.create({
      tableId, start_date, end_date, guest_name, guest_phone
    })
    res.status(201).json(response)
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.addTable = async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(401).json(getErrorFormat(errors))
  }

  const {name, seats} = req.body
  try {
    const response = await req.user.createTable({
      name, seats,
      image: req.file?.filename || '',
      userId: req.user.id
    })
    res.status(201).json(response)
  } catch(error) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.editTable = async (req, res) => {
  try {
    let finalImage = null
    const {name, seats} = req.body
    const table = await Table.findOne({
      where: {
        id: req.params.id
      }
    })
    if(table.image && req.file !== undefined && table.image !== req.file) {
      const uploads = path.join(__dirname, '/', '../uploads', table.image)
      if(fs.existsSync(uploads)) {
        if(uploads) {
          fs.unlinkSync(uploads)
        }
      }
    } else {
      finalImage = table.image
    }
    const updatedTable = await table.update({
      name, seats, image: finalImage ? finalImage : req.file.filename
    })
    res.status(201).json(updatedTable)
  } catch(error) {
    res.status(500).json(getErrorFormat('Global error'))
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
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id)
    res.status(200).json(table)
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.removeTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id)
    if(!table) {
      res.status(401).json(getErrorFormat('Table does not exist'))
    }
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
    res.status(500).json(getErrorFormat('Global error'))
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
    res.status(200).json(reservations)
  } catch(e) {
    res.status(500).json(getErrorFormat('Global error'))
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
    res.status(500).json(getErrorFormat('Global error'))
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
    res.json(500).json(getErrorFormat('Global error'))
  }
}

// exports.fileFilter = (req, file, cb) => {
//   const uploads = path.join(__dirname, '/', '../uploads', table.image)
//   console.log(uploads)
//   if(fs.existsSync(uploads)) {
//     cb(null, false)
//     return
//   }
//
//   cb(null, true)
// }
