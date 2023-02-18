const {validationResult} = require("express-validator");
const {getErrorFormat} = require("../../helper");
const Table = require("../../models/table");
const path = require("path");
const fs = require("fs");
const User = require("../../models/user")
const Reservation = require("../../models/reservation");
const {Op} = require("sequelize");


exports.addTable = async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(401).json(getErrorFormat(errors))
  }

  const {name, seats, active} = req.body
  try {
    const response = await req.user.createTable({
      name, seats, active,
      image: req.file?.filename || '',
      userId: req.user.id
    })
    const data = Object.assign(response.dataValues, {
      user: {
        email: req.user.email,
        nick: req.user.nick,
        avatar: req.user.avatar
      }
    })
    res.status(201).json(data)
  } catch(error) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.editTable = async (req, res) => {
  try {
    let finalImage = null
    const {name, seats, active} = req.body
    const table = await Table.findOne({
      where: {
        id: req.params.id
      }
    })
    if(table.image && req.file !== undefined && table.image !== req.file) {
      const uploads = path.join(__dirname, '/', '../../uploads', table.image)

      if(fs.existsSync(uploads)) {
        if(uploads) {
          console.log('UNLINK')
          fs.unlinkSync(uploads)
        }
      }
    } else {
      finalImage = table.image
    }
    const updatedTable = await table.update({
      name, seats, active, image: finalImage ? finalImage : req.file.filename, userId: req.user.id
    })
    const data = Object.assign(updatedTable.dataValues, {user: {email: req.user.email, nick: req.user.nick, avatar: req.user.avatar}})
    res.status(201).json(data)
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
      const uploads = path.join(__dirname, '/', '../../uploads', table.image)
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
