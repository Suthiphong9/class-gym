const cartService = require("../services/cartService");
const { successResponse } = require("../utils/response");

const addCartItem = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const {
            variant_id,
            quantity
        } = req.body;

        const item =
            await cartService.addCartItem(
                userId,
                Number(variant_id),
                Number(quantity)
            );

        return successResponse(
            res,
            201,
            "Cart item added successfully",
            item
        );

    } catch (error) {
        next(error);
    }
};

const getCart = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const cart =
            await cartService.getCart(userId);

        return successResponse(
            res,
            200,
            "Cart retrieved successfully",
            cart
        );

    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const cartItemId = Number(req.params.id);

        const quantity = Number(req.body.quantity);

        const item =
            await cartService.updateCartItem(
                userId,
                cartItemId,
                quantity
            );

        return successResponse(
            res,
            200,
            "Cart item updated successfully",
            item
        );

    } catch (error) {
        next(error);
    }
};

const deleteCartItem = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const cartItemId = Number(req.params.id);

        const result =
            await cartService.deleteCartItem(
                userId,
                cartItemId
            );

        return successResponse(
            res,
            200,
            "Cart item removed successfully"
        );

    } catch (error) {
        next(error);
    }
};


module.exports = {
    addCartItem, getCart, updateCartItem,deleteCartItem
};