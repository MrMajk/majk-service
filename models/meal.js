const { DataTypes } = require('sequelize')

const sequelize = require('../config/database')

const Meal = sequelize.define('meal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  price: DataTypes.STRING,
  image: DataTypes.STRING,
  active: DataTypes.BOOLEAN
})

module.exports = Meal
