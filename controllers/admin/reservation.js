const Reservation = require("../../models/reservation")
const Table = require("../../models/table")
const {Op} = require("sequelize")
const {validationResult} = require("express-validator");
const {getErrorFormat} = require("../../helper");


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
