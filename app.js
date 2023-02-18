const sequelize = require('./config/database')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require("cors")
const User = require("./models/user");
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const Reservation = require("./models/reservation");
const Table = require("./models/table");
const jwt = require("jsonwebtoken");
const Meal = require("./models/meal");

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if(token) {
      const {userId} = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      if (userId) {
        const currentUser = await User.findByPk(userId)
        req.user = currentUser
      }
    }
    next()
  } catch {
    next()
  }
})

app.use('/uploads', express.static('./uploads'))
app.use('/avatars', express.static('./avatars'))
app.use(authRouter)
app.use(userRouter)
app.use(adminRouter)

Table.hasMany(Reservation)
User.hasOne(Table)
Table.belongsTo(User)
User.hasOne(Meal)
Meal.belongsTo(User)
Table.hasOne(Reservation)
Reservation.belongsTo(Table)


// sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then ( function () {
  sequelize
    .sync({force: false, logging: console.log})
    .then(() => {
      console.log('DB started...')
      app.listen(8082)
    })
    .catch(error => {
      console.log(error)
    })
// })
