const express = require("express");
const router = express.Router();

const Scooter = require("../models/Scooter");
const Ride = require("../models/Ride");

router.get("/", async (req, res) => {
  try {
    const scooters = await Scooter.findAll({
      order: [["id", "ASC"]],
    });

    const rides = await Ride.findAll();

    const scooterStats = scooters.map((scooter) => {
      const scooterRides = rides.filter(
        (ride) => ride.scooterId === scooter.id
      );

      const revenue = scooterRides.reduce(
        (sum, ride) => sum + Number(ride.cost || 0),
        0
      );

      return {
        scooterId: scooter.id,
        model: scooter.model,
        ridesCount: scooterRides.length,
        revenue,
      };
    });

    const totalRevenue = scooterStats.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    res.json({
      scootersCount: scooters.length,
      totalRevenue,
      scooterStats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения статистики",
      error: error.message,
    });
  }
});

module.exports = router;