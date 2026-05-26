const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Payment = require("../models/Payment");

router.put("/:id/topup", async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    user.balance += Number(amount);
    await user.save();

    await Payment.create({
      userId: user.id,
      type: "topup",
      amount: Number(amount),
      description: "Пополнение баланса",
    });

    res.json({
      message: "Баланс пополнен",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка пополнения баланса",
      error: error.message,
    });
  }
});

router.get("/:id/payments", async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {
        userId: req.params.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения платежей",
      error: error.message,
    });
  }
});

module.exports = router;