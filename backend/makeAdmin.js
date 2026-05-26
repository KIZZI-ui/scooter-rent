require("dotenv").config();

const sequelize = require("./config/db");
const User = require("./models/User");

async function makeAdmin() {
  try {
    await sequelize.authenticate();

    const user = await User.findOne({
      where: {
        email: "admin@scooter.ru",
      },
    });

    if (!user) {
      console.log("Пользователь не найден");
      process.exit();
    }

    user.role = "admin";
    await user.save();

    console.log("Пользователь стал админом");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

makeAdmin();