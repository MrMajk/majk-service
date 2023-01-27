const { DataTypes } = require('sequelize')

const sequelize = require('../config/database')

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  avatar: DataTypes.STRING,
  nick: DataTypes.STRING
})

module.exports = User
