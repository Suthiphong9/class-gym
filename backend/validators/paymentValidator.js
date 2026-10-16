const AppError = require("../errors/AppError");

const validateCreatePayment = (req, res, next) => {
  const { order_id, payment_method } = req.body;

  const orderId = Number(order_id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new AppError("Invalid order ID", 400);
  }

  const allowedMethods = ["bank_transfer", "cash"];

  if (!allowedMethods.includes(payment_method)) {
    throw new AppError("Invalid payment method", 400);
  }

  if (payment_method === "bank_transfer" && !req.file) {
    throw new AppError("Payment slip is required", 400);
  }

  next();
};

const validatePaymentId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid payment ID", 400);
  }

  next();
};

const validateUpdatePaymentStatus = (req, res, next) => {
  const { status } = req.body || {};

  const allowedStatuses = ["verified", "rejected"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid payment status", 400);
  }

  next();
};

module.exports = {
  validateCreatePayment,
  validatePaymentId,
  validateUpdatePaymentStatus,
};
