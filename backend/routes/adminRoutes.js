const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getAllMemberships,
  getMembershipByIdForAdmin,
  updateMembershipStatus,
  getAllPlansForAdmin,
  createMembershipPlan,
  getMembershipPlanById,
  updateMembershipPlan,
  updateMembershipPlanStatus,
} = require("../controllers/membershipController");
const {
  validateMembershipId,
  validateMembershipStatus,
  validateCreatePlan,
  validateUpdatePlan,
  validatePlanStatus,
} = require("../validators/membershipValidator");
const {
  validateBookingId,
  validateBookingStatus,
} = require("../validators/bookingValidator");

const {
  getAllBookings,
  getBookingByIdForAdmin,
  updateBookingStatus,
} = require("../controllers/bookingController");
const {
  validateCreateProduct,
  validateProductId,
  validateUpdateProduct,
  validateProductStatus,
  validateCreateVariant,
  validateProductIdParam,
  validateVariantId,
  validateUpdateVariant,
  validateVariantStatus,
} = require("../validators/productValidator");
const {
  createProduct,
  getAllProductsForAdmin,
  getProductByIdForAdmin,
  updateProduct,
  updateProductStatus,
  createProductVariant,
  getProductVariantsForAdmin,
  updateProductVariant,
  updateProductVariantStatus,
} = require("../controllers/productController");
const {
  getAllOrdersForAdmin,
  getOrderByIdForAdmin,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  validateOrderId,
  validateUpdateOrderStatus,
  validatePagination,
  validateOrderFilter,
  validateOrderSearch,
  validateOrderSort,
} = require("../validators/orderValidator");
const {
  getAllPaymentsForAdmin,
  getPaymentByIdForAdmin,
  updatePaymentStatus,
  getPaymentSlipForAdmin,
} = require("../controllers/paymentController");
const {
  validatePaymentId,
  validateUpdatePaymentStatus,
} = require("../validators/paymentValidator");
const { getAdminDashboard } = require("../controllers/adminController");


router.get("/dashboard",authMiddleware,roleMiddleware("admin"),getAdminDashboard)
router.get(
  "/bookings",
  authMiddleware,
  roleMiddleware("admin"),
  getAllBookings,
);
router.get(
  "/bookings/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateBookingId,
  getBookingByIdForAdmin,
);
router.patch(
  "/bookings/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateBookingId,
  validateBookingStatus,
  updateBookingStatus,
);
router.get(
  "/memberships",
  authMiddleware,
  roleMiddleware("admin"),
  getAllMemberships,
);

router.get(
  "/memberships/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMembershipId,
  getMembershipByIdForAdmin,
);

router.patch(
  "/memberships/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateMembershipId,
  validateMembershipStatus,
  updateMembershipStatus,
);

router.get(
  "/membership-plans",
  authMiddleware,
  roleMiddleware("admin"),
  getAllPlansForAdmin,
);
router.post(
  "/membership-plans",
  authMiddleware,
  roleMiddleware("admin"),
  validateCreatePlan,
  createMembershipPlan,
);
router.get(
  "/membership-plans/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMembershipId,
  getMembershipPlanById,
);
router.put(
  "/membership-plans/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMembershipId,
  validateUpdatePlan,
  updateMembershipPlan,
);
router.patch(
  "/membership-plans/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMembershipId,
  validatePlanStatus,
  updateMembershipPlanStatus,
);

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

router.post(
  "/products",
  authMiddleware,
  roleMiddleware("admin"),
  validateCreateProduct,
  createProduct,
);
router.get(
  "/products",
  authMiddleware,
  roleMiddleware("admin"),
  getAllProductsForAdmin,
);
router.get(
  "/products/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateProductId,
  getProductByIdForAdmin,
);
router.put(
  "/products/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateProductId,
  validateUpdateProduct,
  updateProduct,
);
router.patch(
  "/products/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateProductId,
  validateProductStatus,
  updateProductStatus,
);

router.post(
  "/products/:productId/variants",
  authMiddleware,
  roleMiddleware("admin"),
  validateProductIdParam,
  validateCreateVariant,
  createProductVariant,
);
router.get(
  "/products/:productId/variants",
  authMiddleware,
  roleMiddleware("admin"),
  validateProductIdParam,
  getProductVariantsForAdmin,
);

router.put(
  "/variants/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateVariantId,
  validateUpdateVariant,
  updateProductVariant,
);

router.patch(
  "/variants/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateVariantId,
  validateVariantStatus,
  updateProductVariantStatus,
);

router.get(
  "/orders",
  authMiddleware,
  roleMiddleware("admin"),
  validatePagination,
  validateOrderSearch,
  validateOrderFilter,
  validateOrderSort,
  getAllOrdersForAdmin,
);

router.get(
  "/orders/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateOrderId,
  getOrderByIdForAdmin,
);

router.patch(
  "/orders/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validateOrderId,
  validateUpdateOrderStatus,
  updateOrderStatus,
);

router.get(
  "/payments",
  authMiddleware,
  roleMiddleware("admin"),
  getAllPaymentsForAdmin,
);

router.get(
  "/payments/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validatePaymentId,
  getPaymentByIdForAdmin,
);

router.patch(
  "/payments/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  validatePaymentId,
  validateUpdatePaymentStatus,
  updatePaymentStatus,
);

router.get(
  "/payments/:id/slip",
  authMiddleware,
  roleMiddleware("admin"),
  validatePaymentId,
  getPaymentSlipForAdmin,
);

module.exports = router;
