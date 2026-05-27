const express = require("express");
const router = express.Router();

const Ride = require("../models/Ride");
const Scooter = require("../models/Scooter");
const User = require("../models/User");
const Payment = require("../models/Payment");

router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await Ride.destroy({
      where: {
        userId: userId,
      },
    });

    res.json({
      success: true,
      message: "История очищена",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Ошибка удаления",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const rides = await Ride.findAll({
      where: {
        userId: req.params.userId,
      },

      order: [["createdAt", "DESC"]],

      include: [
        {
          model: Scooter,
          attributes: ["model"],
        },
      ],
    });

    res.json(rides);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения поездок",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { scooterId, duration, cost, userId } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    if (user.balance < cost) {
      return res.status(400).json({
        message: "Недостаточно средств",
      });
    }

    user.balance -= cost;
    await user.save();

const ride = await Ride.create({
  scooterId,
  userId,
  duration,
  cost,
});

    await Payment.create({
      userId: user.id,
      type: "ride",
      amount: -cost,
      description: "Оплата поездки",
    });

    res.status(201).json({
      ride,
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка сохранения поездки",
      error: error.message,
    });
  }
});

module.exports = router;