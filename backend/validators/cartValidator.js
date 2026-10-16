const AppError = require("../errors/AppError");

const validateAddCartItem = (req, res, next) => {
    const { variant_id, quantity } = req.body;

    // ตรวจ variant_id
    const variantId = Number(variant_id);

    if (
        !Number.isInteger(variantId) ||
        variantId <= 0
    ) {
        throw new AppError(
            "Invalid variant ID",
            400
        );
    }

    // ตรวจ quantity
    const itemQuantity = Number(quantity);

    if (
        !Number.isInteger(itemQuantity) ||
        itemQuantity <= 0
    ) {
        throw new AppError(
            "Quantity must be a positive integer",
            400
        );
    }

    next();
};

const validateCartItemId = (req, res, next) => {
    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new AppError(
            "Invalid cart item ID",
            400
        );
    }

    next();
};

const validateUpdateCartItem = (req, res, next) => {
    const { quantity } = req.body;

    const itemQuantity = Number(quantity);

    if (
        !Number.isInteger(itemQuantity) ||
        itemQuantity <= 0
    ) {
        throw new AppError(
            "Quantity must be a positive integer",
            400
        );
    }

    next();
};

module.exports = {
    validateAddCartItem,
    validateCartItemId,
    validateUpdateCartItem
};