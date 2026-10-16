const express = require("express")
const router = express.Router();
const authController = require("../controllers/authController");
const authValidator = require("../validators/authValidator")
const {loginLimiter} = require("../middleware/rateLimitMiddleware")

router.post("/register",authValidator.validateRegister, authController.register)
router.post("/login",loginLimiter,authValidator.validateLogin, authController.login)
router.post("/refresh",authController.refresh)
router.post("/logout", authController.logout)

module.exports = router;