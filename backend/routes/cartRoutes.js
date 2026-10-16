const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    validateAddCartItem,
    validateCartItemId,
    validateUpdateCartItem
} = require("../validators/cartValidator");

const {
    addCartItem,getCart,
    updateCartItem,
    deleteCartItem
} = require("../controllers/cartController");


router.post(
    "/items",
    authMiddleware,
    validateAddCartItem,
    addCartItem
);

router.get(
    "/",
    authMiddleware,
    getCart
);

router.put(
    "/items/:id",
    authMiddleware,
    validateCartItemId,
    validateUpdateCartItem,
    updateCartItem
);

router.delete(
    "/items/:id",
    authMiddleware,
    validateCartItemId,
    deleteCartItem
);

module.exports = router;