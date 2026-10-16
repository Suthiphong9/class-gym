const jwt = require("jsonwebtoken");
const env = require("../config/env")
const authMiddleware = (req, res, next) => {
  try {
    // เรียกใช้ Autorization <Bearer> token
    const authHeader = req.headers.authorization;

    // ตรวจสอบว่าเป็น <Bearer> token
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Access token is required",
      });
    }

    // แยก token ออกจาก <Bearer>
    const token = authHeader.split(" ")[1];

    // ตรวจสอบว่า token ตรงกันไหม
    const decoded = jwt.verify(token, env.jwtSecret);

    // เก็บข้อมูลไว้ใน req.user
    req.user = decoded;

    // ไปทำใน Controller
    next();
  } catch (error) {
    console.error(error);

    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;