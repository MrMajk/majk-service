const User = require("../models/user");
require('dotenv').config()


exports.getUser = async (req, res) => {
  const id = req.params.id

  const user = await User.findOne({
    where: { id }
  })
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      nick: user.nick,
      avatar: user.avatar,
      role: user.role
    })
  } else {
    res.status(401).json({
      errors: [{
        message: 'Invalid user data'
      }]
    })
  }
}
