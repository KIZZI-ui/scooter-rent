const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Scooter = require("../models/Scooter");
const Ride = require("../models/Ride");
const Payment = require("../models/Payment");

router.get("/", async (req, res) => {
  try {
    const usersCount = await User.count();
    const scootersCount = await Scooter.count();
    const ridesCount = await Ride.count();

    const payments = await Payment.findAll();

    const revenue = payments
      .filter((payment) => payment.type === "ride")
      .reduce((sum, payment) => sum + Math.abs(payment.amount), 0);

    res.json({
      usersCount,
      scootersCount,
      ridesCount,
      revenue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения статистики",
      error: error.message,
    });
  }
});

module.exports = router;