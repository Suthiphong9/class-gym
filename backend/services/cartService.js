const pool = require("../config/db");
const AppError = require("../errors/AppError");

const getOrCreateCart = async (userId) => {

    const [carts] = await pool.query(
        `SELECT
            id,
            user_id,
            created_at
         FROM carts
         WHERE user_id = ?`,
        [userId]
    );

    if (carts.length > 0) {
        return carts[0];
    }

    const [result] = await pool.query(
        `INSERT INTO carts
        (user_id)
        VALUES (?)`,
        [userId]
    );

    const [newCarts] = await pool.query(
        `SELECT
            id,
            user_id,
            created_at
         FROM carts
         WHERE id = ?`,
        [result.insertId]
    );

    return newCarts[0];
};

const addCartItem = async (
    userId,
    variantId,
    quantity
) => {

    // 1. หา / สร้าง Cart
    const cart = await getOrCreateCart(userId);

    // 2. ตรวจสอบ Variant
    const [variants] = await pool.query(
        `SELECT
            pv.id,
            pv.product_id,
            pv.variant_name,
            pv.price,
            pv.stock,
            pv.is_active,
            p.name AS product_name,
            p.is_active AS product_is_active
         FROM product_variants pv
         JOIN products p
            ON pv.product_id = p.id
         WHERE pv.id = ?`,
        [variantId]
    );

    if (variants.length === 0) {
        throw new AppError(
            "Variant not found",
            404
        );
    }

    const variant = variants[0];

    // 3. ตรวจ Product
    if (!variant.product_is_active) {
        throw new AppError(
            "Product is not available",
            400
        );
    }

    // 4. ตรวจ Variant
    if (!variant.is_active) {
        throw new AppError(
            "Product variant is not available",
            400
        );
    }

    // 5. ตรวจ Stock
    if (quantity > variant.stock) {
        throw new AppError(
            "Insufficient stock",
            400
        );
    }

    // 6. ตรวจว่ามีสินค้าใน Cart แล้วหรือยัง
    const [existingItems] = await pool.query(
        `SELECT
            id,
            quantity
         FROM cart_items
         WHERE cart_id = ?
         AND variant_id = ?`,
        [
            cart.id,
            variantId
        ]
    );

    if (existingItems.length > 0) {

        const newQuantity =
            existingItems[0].quantity + quantity;

        // 7. ตรวจ Stock อีกครั้ง
        if (newQuantity > variant.stock) {
            throw new AppError(
                "Insufficient stock",
                400
            );
        }

        await pool.query(
            `UPDATE cart_items
             SET quantity = ?
             WHERE id = ?`,
            [
                newQuantity,
                existingItems[0].id
            ]
        );

    } else {

        // 8. เพิ่มสินค้าใหม่
        await pool.query(
            `INSERT INTO cart_items
            (
                cart_id,
                variant_id,
                quantity
            )
            VALUES (?, ?, ?)`,
            [
                cart.id,
                variantId,
                quantity
            ]
        );
    }

    // 9. ดึง Cart Item ล่าสุด
    const [items] = await pool.query(
        `SELECT
            ci.id,
            ci.cart_id,
            ci.variant_id,
            ci.quantity,
            pv.variant_name,
            pv.price,
            pv.stock,
            p.name AS product_name
         FROM cart_items ci
         JOIN product_variants pv
            ON ci.variant_id = pv.id
         JOIN products p
            ON pv.product_id = p.id
         WHERE ci.cart_id = ?
         AND ci.variant_id = ?`,
        [
            cart.id,
            variantId
        ]
    );

    return items[0];
};

const getCart = async (userId) => {
    const [carts] = await pool.query(
        `SELECT
        id,
        user_id,
        created_at
        FROM carts
        WHERE user_id = ?`,
        [userId]
    )

    if(carts.length === 0) {
        return {
            id:null,
            user_id: userId,
            items:[]
        }
    }

    const cart = carts[0]

    const [items] = await pool.query(
        `SELECT
        ci.id,
        ci.cart_id,
        ci.variant_id,
        ci.quantity,
        
        pv.variant_name,
        pv.price,
        pv.stock,
        pv.is_active AS variant_is_active,
        
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.category,
        p.is_active AS product_is_active
        
        FROM cart_items ci
        
        JOIN product_variants pv
        ON ci.variant_id = pv.id
        
        JOIN products p
        ON pv.product_id = p.id
        
        WHERE ci.cart_id = ?
        
        ORDER BY ci.id ASC`,
        [cart.id]
    )

    return {
        id:cart.id,
        user_id:cart.user_id,
        created_at: cart.created_at,
        items
    }
}

const updateCartItem = async (userId, cartItemId, quantity) => {

    // 1. ตรวจสอบว่า Cart Item นี้เป็นของ User คนนี้จริงหรือไม่
    const [items] = await pool.query(
        `SELECT
            ci.id,
            ci.cart_id,
            ci.variant_id,
            ci.quantity,
            pv.stock,
            pv.is_active AS variant_is_active,
            p.is_active AS product_is_active
         FROM cart_items ci
         JOIN carts c
            ON ci.cart_id = c.id
         JOIN product_variants pv
            ON ci.variant_id = pv.id
         JOIN products p
            ON pv.product_id = p.id
         WHERE ci.id = ?
         AND c.user_id = ?`,
        [cartItemId, userId]
    );

    if (items.length === 0) {
        throw new AppError(
            "Cart item not found",
            404
        );
    }

    const item = items[0];

    // 2. ตรวจสอบ Product
    if (!item.product_is_active) {
        throw new AppError(
            "Product is not available",
            400
        );
    }

    // 3. ตรวจสอบ Variant
    if (!item.variant_is_active) {
        throw new AppError(
            "Product variant is not available",
            400
        );
    }

    // 4. ตรวจสอบ Stock
    if (quantity > item.stock) {
        throw new AppError(
            "Insufficient stock",
            400
        );
    }

    // 5. Update quantity
    await pool.query(
        `UPDATE cart_items
         SET quantity = ?
         WHERE id = ?`,
        [quantity, cartItemId]
    );

    // 6. ดึงข้อมูลล่าสุดกลับมา
    const [updatedItems] = await pool.query(
        `SELECT
            ci.id,
            ci.cart_id,
            ci.variant_id,
            ci.quantity,
            pv.variant_name,
            pv.price,
            pv.stock,
            pv.is_active AS variant_is_active,
            p.id AS product_id,
            p.name AS product_name,
            p.is_active AS product_is_active
         FROM cart_items ci
         JOIN product_variants pv
            ON ci.variant_id = pv.id
         JOIN products p
            ON pv.product_id = p.id
         WHERE ci.id = ?`,
        [cartItemId]
    );

    return updatedItems[0];
};

const deleteCartItem = async (userId, cartItemId) => {

    // 1. ตรวจสอบว่า Cart Item เป็นของ User คนนี้หรือไม่
    const [items] = await pool.query(
        `SELECT
            ci.id,
            ci.cart_id,
            ci.variant_id
         FROM cart_items ci
         JOIN carts c
            ON ci.cart_id = c.id
         WHERE ci.id = ?
         AND c.user_id = ?`,
        [cartItemId, userId]
    );

    // 2. ไม่พบ Cart Item
    if (items.length === 0) {
        throw new AppError(
            "Cart item not found",
            404
        );
    }

    // 3. ลบ Cart Item
    await pool.query(
        `DELETE FROM cart_items
         WHERE id = ?`,
        [cartItemId]
    );

    return {
        id: cartItemId
    };
};

module.exports = {getOrCreateCart,addCartItem,getCart,updateCartItem,deleteCartItem}