const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  validateCreateOrder,
  validateOrderId,
} = require("../validators/orderValidator");

const {
  createOrder,
  getOrdersByUser,
  getOrderById,
} = require("../controllers/orderController");

router.post("/", authMiddleware, validateCreateOrder, createOrder);
router.get("/", authMiddleware, getOrdersByUser);
router.get("/:id", authMiddleware, validateOrderId, getOrderById);


module.exports = router;
