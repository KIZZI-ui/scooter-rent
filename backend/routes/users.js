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

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
  "id",
  "username",
  "email",
  "phone",
  "role",
  "balance",
  "status",
  "isOnline",
  "lastSeenAt",
  "blockReason",
  "createdAt",
],
      order: [["createdAt", "DESC"]],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения пользователей",
      error: error.message,
    });
  }
});

router.put("/:id/block", async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    user.status = "blocked";
    user.blockReason = reason || "Заблокирован администратором";

    await user.save();

    res.json({
      message: "Пользователь заблокирован",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка блокировки пользователя",
      error: error.message,
    });
  }
});

router.put("/:id/unblock", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    user.status = "active";
    user.blockReason = null;

    await user.save();

    res.json({
      message: "Пользователь разблокирован",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка разблокировки пользователя",
      error: error.message,
    });
  }
});

router.put("/:id/online", async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  user.isOnline = true;
  user.lastSeenAt = new Date();

  await user.save();

  res.json({ message: "Пользователь онлайн" });
});

router.put("/:id/offline", async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  user.isOnline = false;
  user.lastSeenAt = new Date();

  await user.save();

  res.json({ message: "Пользователь офлайн" });
});

module.exports = router;