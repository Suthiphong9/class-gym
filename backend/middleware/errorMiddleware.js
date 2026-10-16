const multer = require("multer");
const logger = require("../utils/logger");
const env = require("../config/env")
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = env.nodeEnv === "production";

  logger.error("Request Error", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    userId: req.user?.id || null,
    stack: err.stack,
  });

  // =========================
  // Multer Error
  // =========================

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size must not exceed 5 MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload failed",
    });
  }

  // =========================
  // Invalid File Type
  // =========================

  if (err.message === "Invalid file type") {
    return res.status(400).json({
      success: false,
      message: "Only JPG, PNG and WEBP files are allowed",
    });
  }

  // =========================
  // Invalid File Extension
  // =========================

  if (err.message === "Invalid file extension") {
    return res.status(400).json({
      success: false,
      message: "Invalid file extension",
    });
  }

  // =========================
  // Default Error
  // =========================

  if (isProduction && !err.isOperational) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;
