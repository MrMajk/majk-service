const sequelize = require('./config/database')
const express = require('express')
const bodyParser = require('body-parser')


const app = express()
app.use(bodyParser.json())

sequelize.sync({force: false})
  .then(() => {
    console.log('DB started...')
    app.listen(8082)
  })
  .catch(error => {
    console.log(error)
  })
