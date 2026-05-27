const express = require("express");
const router = express.Router();

const Scooter = require("../models/Scooter");
const Ride = require("../models/Ride");

const getWeekStart = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);

  return current;
};

router.get("/", async (req, res) => {
  try {
    const scooters = await Scooter.findAll({
      order: [["id", "ASC"]],
    });

    const rides = await Ride.findAll();

    const now = new Date();
    const weekStart = getWeekStart(now);

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const scooterStats = scooters.map((scooter) => {
  const scooterRidesToday = rides.filter((ride) => {
    const rideDate = new Date(ride.createdAt);

    return (
      ride.scooterId === scooter.id &&
      rideDate >= todayStart
    );
  });

  const revenue = scooterRidesToday.reduce(
    (sum, ride) => sum + Number(ride.cost || 0),
    0
  );

  return {
    scooterId: scooter.id,
    model: scooter.model,
    ridesCount: scooterRidesToday.length,
    revenue,
  };
});

    const todayRevenue = rides.reduce((sum, ride) => {
      const rideDate = new Date(ride.createdAt);

      if (rideDate >= todayStart) {
        return sum + Number(ride.cost || 0);
      }

      return sum;
    }, 0);

    const weekIncome = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(
      (label) => ({
        label,
        value: 0,
      })
    );

    const monthIncome = [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ].map((label) => ({
      label,
      value: 0,
    }));

    const yearIncome = ["2024", "2025", "2026", "2027", "2028", "2029"].map(
      (label) => ({
        label,
        value: 0,
      })
    );

    rides.forEach((ride) => {
      const rideDate = new Date(ride.createdAt);
      const cost = Number(ride.cost || 0);

      if (rideDate >= weekStart) {
        const day = rideDate.getDay();
        const index = day === 0 ? 6 : day - 1;

        weekIncome[index].value += cost;
      }

      if (rideDate.getFullYear() === currentYear) {
        const monthIndex = rideDate.getMonth();

        monthIncome[monthIndex].value += cost;
      }

      const rideYear = rideDate.getFullYear();
      const yearIndex = rideYear - 2024;

      if (yearIndex >= 0 && yearIndex < yearIncome.length) {
        yearIncome[yearIndex].value += cost;
      }
    });

    res.json({
      scootersCount: scooters.length,
      todayRevenue,
      scooterStats,
      income: {
        week: weekIncome,
        month: monthIncome,
        year: yearIncome,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка получения статистики",
      error: error.message,
    });
  }
});

module.exports = router;