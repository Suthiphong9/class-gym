const express = require("express")
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {validateCreateInstructor,validateInstructorId, validateUpdateInstructor} = require("../validators/instructorValidator")
const {createInstructor, getAllInstructors, getInstructorById, updateInstructor, deleteInstructor} = require("../controllers/instructorController")

router.post("/", authMiddleware, roleMiddleware("admin"), validateCreateInstructor, createInstructor)
router.get("/",authMiddleware,roleMiddleware("admin"),getAllInstructors);
router.get("/:id",authMiddleware,roleMiddleware("admin"),validateInstructorId,getInstructorById)
router.put("/:id", authMiddleware,roleMiddleware("admin"),validateInstructorId, validateUpdateInstructor, updateInstructor)
router.delete("/:id", authMiddleware,roleMiddleware("admin"),validateInstructorId, deleteInstructor)

module.exports = router;