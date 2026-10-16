const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    validateCreateBooking,
    validateBookingId
} = require("../validators/bookingValidator");

const {
    createBooking, getMyBookings, getBookingById, cancelBooking
} = require("../controllers/bookingController");


router.post(
    "/",
    authMiddleware,
    validateCreateBooking,
    createBooking
);

router.get("/",authMiddleware,getMyBookings)
router.get("/:id",authMiddleware,authMiddleware,validateBookingId,getBookingById)
router.delete("/:id",authMiddleware,validateBookingId,cancelBooking)

module.exports = router;