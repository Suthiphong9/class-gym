const express = require("express");
const uploadSlip = require("../middleware/uploadMiddleware");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    validateCreatePayment,
    validatePaymentId
} = require("../validators/paymentValidator");

const {
    createPayment,
    getPaymentsByUser,
    getPaymentByUser,
    getPaymentSlip
} = require("../controllers/paymentController");

router.post(
    "/",
    authMiddleware,
    uploadSlip.single("slip"),
    validateCreatePayment,
    createPayment
);

router.get(
    "/",
    authMiddleware,
    getPaymentsByUser
);

router.get(
    "/:id",
    authMiddleware,
    validatePaymentId,
    getPaymentByUser
);

router.get(
    "/:id/slip",
    authMiddleware,
    validatePaymentId,
    getPaymentSlip
);



module.exports = router;