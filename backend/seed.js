require("dotenv").config();

const sequelize = require("./config/db");
const Scooter = require("./models/Scooter");

async function seed() {
  try {
    await sequelize.authenticate();

    await sequelize.sync();

    await Scooter.destroy({
      where: {},
    });

    await Scooter.bulkCreate([
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
    ]);

    console.log("Самокаты добавлены 🚀");

    process.exit();
  } catch (error) {
    console.error(error);
  }
}

seed();