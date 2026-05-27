require("dotenv").config();

const sequelize = require("./config/db");
const Scooter = require("./models/Scooter");
const Ride = require("./models/Ride");

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    await Ride.destroy({ where: {} });
    await Scooter.destroy({ where: {} });

    const scooters = await Scooter.bulkCreate([
      {
        model: "S-101",
        charge: 78,
        latitude: 55.751244,
        longitude: 37.618423,
      },
      {
        model: "S-102",
        charge: 64,
        latitude: 55.761244,
        longitude: 37.628423,
      },
      {
        model: "S-103",
        charge: 91,
        latitude: 55.741244,
        longitude: 37.608423,
      },
      {
        model: "S-104",
        charge: 82,
        latitude: 55.7558,
        longitude: 37.6173,
      },
      {
        model: "S-105",
        charge: 56,
        latitude: 55.748,
        longitude: 37.626,
      },
    ]);

    await Ride.bulkCreate([
      { scooterId: scooters[0].id, userId: 1, duration: 320, cost: 540, createdAt: new Date("2026-01-12") },
      { scooterId: scooters[1].id, userId: 1, duration: 210, cost: 420, createdAt: new Date("2026-02-08") },
      { scooterId: scooters[2].id, userId: 1, duration: 440, cost: 760, createdAt: new Date("2026-03-17") },
      { scooterId: scooters[0].id, userId: 1, duration: 180, cost: 310, createdAt: new Date("2026-04-03") },
      { scooterId: scooters[3].id, userId: 1, duration: 510, cost: 980, createdAt: new Date("2026-05-25") },
      { scooterId: scooters[4].id, userId: 1, duration: 260, cost: 470, createdAt: new Date("2026-06-11") },
      { scooterId: scooters[1].id, userId: 1, duration: 700, cost: 1320, createdAt: new Date("2026-07-09") },
      { scooterId: scooters[2].id, userId: 1, duration: 360, cost: 650, createdAt: new Date("2026-08-14") },
      { scooterId: scooters[3].id, userId: 1, duration: 540, cost: 1100, createdAt: new Date("2026-09-02") },
      { scooterId: scooters[4].id, userId: 1, duration: 820, cost: 1640, createdAt: new Date("2026-10-19") },
      { scooterId: scooters[0].id, userId: 1, duration: 290, cost: 520, createdAt: new Date("2026-11-07") },
      { scooterId: scooters[1].id, userId: 1, duration: 460, cost: 870, createdAt: new Date("2026-12-21") },
    ]);

    console.log("Самокаты и тестовые поездки добавлены 🚀");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();