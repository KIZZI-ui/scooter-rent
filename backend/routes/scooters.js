const express = require("express");
const router = express.Router();

const Scooter = require("../models/Scooter");
const User = require("../models/User");
const adminOnly = require("../middleware/adminOnly");

const clearReservation = (scooter) => {
  scooter.status = "available";
  scooter.reservedUntil = null;
  scooter.reservedByUserId = null;
};

const normalizeExpiredReservation = async (scooter) => {
  const now = new Date();

  if (
    scooter.status === "reserved" &&
    (!scooter.reservedByUserId ||
      !scooter.reservedUntil ||
      new Date(scooter.reservedUntil) < now)
  ) {
    clearReservation(scooter);
    await scooter.save();
  }
};

router.get("/", async (req, res) => {
  try {
    const scooters = await Scooter.findAll({
      order: [["id", "ASC"]],
    });

    for (const scooter of scooters) {
      await normalizeExpiredReservation(scooter);
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
      reservedByUserId: null,
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Войдите в аккаунт, чтобы забронировать самокат",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    await normalizeExpiredReservation(scooter);

    if (scooter.status !== "available") {
      return res.status(400).json({
        message: "Самокат сейчас недоступен для бронирования",
        scooter,
      });
    }

    const reservedUntil = new Date(Date.now() + 5 * 60 * 1000);

    scooter.status = "reserved";
    scooter.reservedUntil = reservedUntil;
    scooter.reservedByUserId = user.id;

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
    const { userId } = req.body;
    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    await normalizeExpiredReservation(scooter);

    if (scooter.status !== "reserved") {
      return res.status(400).json({
        message: "Самокат не забронирован",
        scooter,
      });
    }

    if (!userId || Number(scooter.reservedByUserId) !== Number(userId)) {
      return res.status(403).json({
        message: "Эта бронь принадлежит другому пользователю",
        scooter,
      });
    }

    clearReservation(scooter);

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
    const { status, userId } = req.body;

    const scooter = await Scooter.findByPk(req.params.id);

    if (!scooter) {
      return res.status(404).json({
        message: "Самокат не найден",
      });
    }

    await normalizeExpiredReservation(scooter);

    if (status === "busy") {
      if (scooter.status !== "reserved") {
        return res.status(400).json({
          message: "Сначала забронируйте самокат",
          scooter,
        });
      }

      if (!userId || Number(scooter.reservedByUserId) !== Number(userId)) {
        return res.status(403).json({
          message: "Этот самокат забронирован другим пользователем",
          scooter,
        });
      }

      scooter.status = "busy";
      scooter.reservedUntil = null;
      scooter.reservedByUserId = null;
    } else if (status === "available") {
      clearReservation(scooter);
    } else {
      scooter.status = status;

      if (status !== "reserved") {
        scooter.reservedUntil = null;
        scooter.reservedByUserId = null;
      }
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
