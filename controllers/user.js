const User = require("../models/user");
require('dotenv').config()


exports.getUser = async (req, res) => {
  const id = req.params.id

  const user = await User.findOne({
    where: { id }
  })
  console.log(user)
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      nick: user.nick,
      avatar: user.avatar
    })
  } else {
    res.status(401).json({
      errors: [{
        message: 'Invalid user data'
      }]
    })
  }
}
