const express = require("express");
const router = express.Router();

const Tariff = require("../models/Tariff");
const adminOnly = require("../middleware/adminOnly");

const getDynamicMinutePrice = (basePrice) => {
  const hour = new Date().getHours();

  if (hour >= 18 && hour <= 22) {
    return Math.ceil(basePrice * 1.5);
  }

  return basePrice;
};

router.get("/", async (req, res) => {
  try {
    let tariff = await Tariff.findOne();

    if (!tariff) {
      tariff = await Tariff.create({
        minutePrice: 7,
        startPrice: 40,
      });
    }

    const dynamicMinutePrice = getDynamicMinutePrice(tariff.minutePrice);

    res.json({
      id: tariff.id,
      startPrice: tariff.startPrice,
      minutePrice: tariff.minutePrice,
      dynamicMinutePrice,
      eveningMultiplierActive:
        dynamicMinutePrice > tariff.minutePrice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения тарифа",
      error: error.message,
    });
  }
});

router.put("/", adminOnly, async (req, res) => {
  try {
    const { minutePrice, startPrice } = req.body;

    let tariff = await Tariff.findOne();

    if (!tariff) {
      tariff = await Tariff.create({
        minutePrice: 7,
        startPrice: 40,
      });
    }

    tariff.minutePrice = Number(minutePrice);
    tariff.startPrice = Number(startPrice);

    await tariff.save();

    res.json({
      message: "Тариф обновлён",
      tariff,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка обновления тарифа",
      error: error.message,
    });
  }
});

module.exports = router;