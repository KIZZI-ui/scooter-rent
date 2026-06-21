require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./config/db");

const scooterRoutes = require("./routes/scooters");
const rideRoutes = require("./routes/rides");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const statsRoutes = require("./routes/stats");
const tariffRoutes = require("./routes/tariff");
const adminStatsRoutes = require("./routes/adminStats");

const Scooter = require("./models/Scooter");
const Ride = require("./models/Ride");

require("./models/User");
require("./models/Payment");
require("./models/Tariff");

Scooter.hasMany(Ride, { foreignKey: "scooterId" });
Ride.belongsTo(Scooter, { foreignKey: "scooterId" });

const app = express();

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const isValidEmail = (email) => {
  return EMAIL_REGEX.test(String(email || "").trim().toLowerCase());
};

app.use(cors());
app.use(express.json());

app.post("/auth/register", (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message:
        "Введите корректный email на английском, например user@mail.ru или user@gmail.com",
    });
  }

  req.body.email = email;

  next();
});

app.use("/scooters", scooterRoutes);
app.use("/rides", rideRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/stats", statsRoutes);
app.use("/tariff", tariffRoutes);
app.use("/admin-stats", adminStatsRoutes);

const PORT = 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL подключён");

    await sequelize.sync({ alter: true });
    console.log("Таблицы созданы");

    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Ошибка подключения к БД:", error);
  }
}

startServer();