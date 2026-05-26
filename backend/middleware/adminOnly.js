const jwt = require("jsonwebtoken");

const SECRET = "SUPER_SECRET_KEY";

const adminOnly = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Нет токена авторизации",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Доступ только для администратора",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Неверный токен",
    });
  }
};

module.exports = adminOnly;