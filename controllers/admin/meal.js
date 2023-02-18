const User = require("../../models/user");
const {getErrorFormat} = require("../../helper");
const Meal = require("../../models/meal");
const path = require("path");
const fs = require("fs");
const {validationResult} = require("express-validator");

exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.findAll({
      include: [{
        model: User,
        attributes: ['email', 'nick', 'avatar']
      }],
      order: [['updatedAt', 'DESC']]
    })
    console.log('MEAL:', meals)
    res.status(200).json(meals)
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.getMealById = async (req, res) => {
  try {
    const meal = await Meal.findByPk(req.params.id)
    res.status(200).json(meal)
  } catch {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.removeMeal = async (req, res) => {
  try {
    const meal = await Meal.findByPk(req.params.id)
    if(!meal) {
      res.status(401).json(getErrorFormat('Meal does not exist'))
    }
    if(meal.image) {
      const uploads = path.join(__dirname, '/', '../../images/meals', meal.image)
      if(fs.existsSync(uploads)) {
        console.log(uploads)
        if(uploads) {
          fs.unlinkSync(uploads)
        }
      }
    }

    await Meal.destroy({
      where: {
        id: req.params.id
      }
    })
    res.status(201).json({id: req.params.id})
  } catch(error) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.editMeal = async (req, res) => {
  try {
    let finalImage = null
    const {name, description, active, price} = req.body
    const meal = await Meal.findOne({
      where: {
        id: req.params.id
      }
    })
    if(meal.image && req.file !== undefined && meal.image !== req.file) {
      const uploads = path.join(__dirname, '/', '../../images/meals', meal.image)
      if(fs.existsSync(uploads)) {
        if(uploads) {
          fs.unlinkSync(uploads)
        }
      }
    } else {
      finalImage = meal.image
    }
    const updatedMeal = await meal.update({
      name, description, price, active, image: finalImage ? finalImage : req.file.filename
    })
    const data = Object.assign(updatedMeal.dataValues, {user: {email: req.user.email, nick: req.user.nick, avatar: req.user.avatar}})

    res.status(201).json(data)
  } catch(error) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}

exports.addMeal = async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(401).json(getErrorFormat(errors))
  }

  const {name, description, price, active} = req.body
  try {
    const response = await req.user.createMeal({
      name, description, price, active,
      image: req.file?.filename || '',
      userId: req.user.id
    })
    const data = Object.assign(response.dataValues, {user: {email: req.user.email, nick: req.user.nick, avatar: req.user.avatar}})

    res.status(201).json(data)
  } catch(error) {
    res.status(500).json(getErrorFormat('Global error'))
  }
}
