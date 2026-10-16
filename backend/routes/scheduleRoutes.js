const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const {
  validateCreateSchedule,
  validateScheduleId,
  validateUpdateSchedule,
} = require("../validators/scheduleValidator");

const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

// CREATE
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateCreateSchedule,
  createSchedule,
);

// GET ALL
router.get("/", authMiddleware, roleMiddleware("admin"), getAllSchedules);

// GET BY ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateScheduleId,
  getScheduleById,
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateScheduleId,
  validateUpdateSchedule,
  updateSchedule,
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateScheduleId,
  deleteSchedule,
);

module.exports = router;
