const express = require("express");

const router = express.Router();
const {validateProductId} = require("../validators/productValidator")
const {
    getActiveProducts, getProductById
} = require("../controllers/productController");


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get active  products
 *     description: Retrieve the list of active products.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Internal server error
 */






router.get(
    "/",
    getActiveProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *         type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

router.get(
    "/:id",
    validateProductId,
    getProductById
);

module.exports = router;