require("dotenv").config();

const express = require("express");
const cors = require("cors");

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

app.use(cors());
app.use(express.json());

app.use("/scooters", scooterRoutes);
app.use("/rides", rideRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/stats", statsRoutes);
app.use("/tariff", tariffRoutes);
app.use("/admin-stats", adminStatsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "ScooterRent API работает",
  });
});

const PORT = 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL подключён");

    await sequelize.sync({ alter: true });
    console.log("Таблицы созданы");

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Ошибка подключения к БД:", error);
  }
}

startServer();