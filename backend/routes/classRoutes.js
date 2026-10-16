const express = require("express")
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {validateCreateClass,validateClassId, validateUpdateClass} = require("../validators/classValidator")
const {createClass, getAllClasses, getClassById, updateClass, deleteClass} = require("../controllers/classController")

router.post("/",authMiddleware,roleMiddleware("admin"),validateCreateClass,createClass)
router.get("/",authMiddleware,roleMiddleware("admin"),getAllClasses)
router.get("/:id",authMiddleware,roleMiddleware("admin"),validateClassId,getClassById)
router.put("/:id",authMiddleware,roleMiddleware("admin"),validateClassId,validateUpdateClass,updateClass)
router.delete("/:id",authMiddleware,roleMiddleware("admin"),validateClassId, deleteClass)
module.exports = router;