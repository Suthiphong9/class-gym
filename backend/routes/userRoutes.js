const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware");
const userValidator = require("../validators/userValidator");
const express = require("express");
const router = express.Router();

router.get("/profile",authMiddleware, userController.getProfile)
router.put("/profile",authMiddleware, userController.updateProfile)
router.put("/password",authMiddleware,userController.changePassword),
router.get("/",authMiddleware,roleMiddleware("admin"),userController.getAllUsers)
router.put("/:id",authMiddleware,roleMiddleware("admin"),userValidator.validateUserId,userValidator.validateUpdateUser, userController.updateUser)
router.delete("/:id",authMiddleware,roleMiddleware("admin"),userValidator.validateUserId,userController.deleteUser)
router.get(
    "/deleted/list",
    authMiddleware,
    roleMiddleware("admin"),
    userController.getDeletedUsers
);
router.get("/:id",authMiddleware,roleMiddleware("admin"),userValidator.validateUserId, userController.getUserById)
router.patch("/:id/restore",authMiddleware,roleMiddleware("admin"),userValidator.validateUserId,userController.restoreUser)


module.exports = router;