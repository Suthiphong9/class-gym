const AppError = require("../errors/AppError");

const validateCreateOrder = (req, res, next) => {
  // Checkout ไม่ต้องรับข้อมูลจาก body
  if (req.body && Object.keys(req.body).length > 0) {
    throw new AppError("Request body must be empty", 400);
  }

  next();
};

const validateOrderId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid order ID", 400);
  }

  next();
};

const validateUpdateOrderStatus = (req, res, next) => {
  const { status } = req.body;

  const allowedStatuses = ["paid", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  next();
};

const validatePagination = (req, res, next) => {
  const page = Number(req.query.page || 1);

  const limit = Number(req.query.limit || 20);

  if (!Number.isInteger(page) || page <= 0) {
    throw new AppError("Invalid page", 400);
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    throw new AppError("Invalid limit", 400);
  }

  req.pagination = {
    page,
    limit,
  };

  next();
};

const validateOrderFilter = (req, res, next) => {
  const { status } = req.query;

  if (!status) {
    next();
    return;
  }

  const allowedStatuses = ["pending", "paid", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid order status filter", 400);
  }

  next();
};

const validateOrderSearch = (
    req,
    res,
    next
) => {

    const {
        search
    } = req.query;

    if (
        search &&
        search.length > 100
    ) {
        throw new AppError(
            "Search is too long",
            400
        );
    }

    next();
};

const validateOrderSort = (req, res, next) => {

    const { sort, order } = req.query;

    const allowedSorts = [
        "created_at",
        "total_amount",
        "status"
    ];

    const allowedOrders = [
        "asc",
        "desc"
    ];

    if (
        sort &&
        !allowedSorts.includes(sort)
    ) {
        throw new AppError(
            "Invalid sort field",
            400
        );
    }

    if (
        order &&
        !allowedOrders.includes(order)
    ) {
        throw new AppError(
            "Invalid sort order",
            400
        );
    }

    next();
};

module.exports = {
  validateCreateOrder,
  validateOrderId,
  validateUpdateOrderStatus,
  validatePagination,
  validateOrderFilter,
  validateOrderSearch,
  validateOrderSort
};
