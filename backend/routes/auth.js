const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const SECRET = "SUPER_SECRET_KEY";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

const userResponse = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  role: user.role,
  balance: user.balance,
  status: user.status,
  blockReason: user.blockReason,
});

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Заполни все поля",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message:
          "Введите корректный email на английском, например user@mail.ru или user@gmail.com",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Пользователь с таким email уже существует",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: email === "admin@scooter.ru" ? "admin" : "user",
    });

    res.status(201).json({
      message: "Пользователь создан",
      user: userResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка регистрации",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Введи email и пароль",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Введите корректный email",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Неверный пароль",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Вход выполнен",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка входа",
      error: error.message,
    });
  }
});

module.exports = router;
