const express = require("express");

const router = express.Router();
const {
    validateCreateMembership
} = require("../validators/membershipValidator");

const {
    getActivePlans, createMembership,getMyMemberships
} = require("../controllers/membershipController");
const authMiddleware = require("../middleware/authMiddleware");


router.get(
    "/plans",
    getActivePlans
);

router.post("/",authMiddleware,validateCreateMembership,createMembership)
router.get("/",authMiddleware,getMyMemberships)


module.exports = router;