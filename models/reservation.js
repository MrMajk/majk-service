const { DataTypes } = require('sequelize')

const sequelize = require('../config/database')

const Reservation = sequelize.define('reservation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  guest_name: DataTypes.STRING,
  guest_phone: DataTypes.STRING
})

module.exports = Reservation
