const orderService = require("../services/orderService");
const { paginationResponse, successResponse } = require("../utils/response");

const createOrder = async (req, res, next) => {
  try {
    // เอา userId จาก JWT
    const userId = req.user.id;

    const order = await orderService.createOrder(userId);

    return successResponse(res, 201, "Order created successfully", order);
  } catch (error) {
    next(error);
  }
};

const getOrdersByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await orderService.getOrdersByUser(userId);

    return successResponse(res, 200, "Get All My Orders", orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orderId = Number(req.params.id);

    const order = await orderService.getOrderById(userId, orderId);

    return successResponse(res, 200, "Order retrieved successfully", order);
  } catch (error) {
    next(error);
  }
};

const getAllOrdersForAdmin = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const { status, search, sort, order } = req.query;

    const result = await orderService.getAllOrdersForAdmin(
      page,
      limit,
      status,
      search,
      sort,
      order,
    );

    return paginationResponse(
      res,
      200,
      "Orders retrieved successfully",
      result.data,
      result.pagination,
    );
  } catch (error) {
    next(error);
  }
};

const getOrderByIdForAdmin = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    const order = await orderService.getOrderByIdForAdmin(orderId);

    return successResponse(
      res,
      200,
      "Get order by ID",
      order,
    );
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);

    return successResponse(
      res,
      200,
      "Order status updated successfully",
      order,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  getAllOrdersForAdmin,
  getOrderByIdForAdmin,
  updateOrderStatus,
};
