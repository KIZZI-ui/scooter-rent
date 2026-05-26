const express = require("express");
const router = express.Router();

const Scooter = require("../models/Scooter");
const adminOnly = require("../middleware/adminOnly");

router.get("/", async (req, res) => {
  try {
    const scooters = await Scooter.findAll({
      order: [["id", "ASC"]],
    });

    const now = new Date();

    for (const scooter of scooters) {
      if (
        scooter.status === "reserved" &&
        scooter.reservedUntil &&
        new Date(scooter.reservedUntil) < now
      ) {
        scooter.status = "available";
        scooter.reservedUntil = null;
        await scooter.save();
      }
    }

    const updatedScooters = await Scooter.findAll({
      order: [["id", "ASC"]],
    });

    res.json(updatedScooters);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения самокатов",
      error: error.message,
    });
  }
});

router.post("/", adminOnly, async (req, res) => {
  try {
    const { model, charge, latitude, longitude, status } = req.body;

    const scooter = await Scooter.create({
      model,
      charge,
      latitude,
      longitude,
      status,
      reservedUntil: null,
    });

    res.status(201).json(scooter);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка создания самоката",
      error: error.message,
    });
  }
});

router.post("/:id/reserve", async (req, res) => {
  try {
    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    if (scooter.status !== "available") {
      return res.status(400).json({
        message: "Самокат сейчас недоступен для бронирования",
      });
    }

    const reservedUntil = new Date(Date.now() + 5 * 60 * 1000);

    scooter.status = "reserved";
    scooter.reservedUntil = reservedUntil;

    await scooter.save();

    res.json({
      message: "Самокат забронирован",
      scooter,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка бронирования самоката",
      error: error.message,
    });
  }
});

router.post("/:id/cancel-reserve", async (req, res) => {
  try {
    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    if (scooter.status !== "reserved") {
      return res.status(400).json({
        message: "Самокат не забронирован",
      });
    }

    scooter.status = "available";
    scooter.reservedUntil = null;

    await scooter.save();

    res.json({
      message: "Бронирование отменено",
      scooter,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка отмены бронирования",
      error: error.message,
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    scooter.status = status;

    if (status !== "reserved") {
      scooter.reservedUntil = null;
    }

    await scooter.save();

    res.json({
      message: "Статус обновлён",
      scooter,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка изменения статуса",
      error: error.message,
    });
  }
});

router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    await scooter.destroy();

    res.json({
      message: "Самокат удалён",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка удаления самоката",
      error: error.message,
    });
  }
});

module.exports = router;