const { DataTypes } = require('sequelize')

const sequelize = require('../config/database')

const Table = sequelize.define('table', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: DataTypes.STRING,
  seats: DataTypes.INTEGER,
  image: DataTypes.STRING
})

module.exports = Table
