const pool = require("../config/db");
const AppError = require("../errors/AppError");

const createOrder = async (userId) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // 1. Get Cart
        const [carts] = await connection.query(
            `SELECT id
             FROM carts
             WHERE user_id = ?`,
            [userId]
        );

        if (carts.length === 0) {
            throw new AppError(
                "Cart is empty",
                400
            );
        }

        const cartId = carts[0].id;


        // 2. Get Cart Items
        const [cartItems] = await connection.query(
            `SELECT
                ci.id,
                ci.variant_id,
                ci.quantity
             FROM cart_items ci
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        if (cartItems.length === 0) {
            throw new AppError(
                "Cart is empty",
                400
            );
        }


        // 3. Check Variant + Stock
        const orderItems = [];

        for (const cartItem of cartItems) {

            const [variants] = await connection.query(
                `SELECT
                    pv.id,
                    pv.product_id,
                    pv.variant_name,
                    pv.price,
                    pv.stock,
                    pv.is_active AS variant_is_active,
                    p.name AS product_name,
                    p.is_active AS product_is_active
                 FROM product_variants pv
                 JOIN products p
                    ON pv.product_id = p.id
                 WHERE pv.id = ?
                 FOR UPDATE`,
                [cartItem.variant_id]
            );

            if (variants.length === 0) {
                throw new AppError(
                    "Product variant not found",
                    404
                );
            }

            const variant = variants[0];


            if (!variant.product_is_active) {
                throw new AppError(
                    "Product is not available",
                    400
                );
            }


            if (!variant.variant_is_active) {
                throw new AppError(
                    "Product variant is not available",
                    400
                );
            }


            if (cartItem.quantity > variant.stock) {
                throw new AppError(
                    "Insufficient stock",
                    400
                );
            }


            const unitPrice =
                Number(variant.price);

            const subtotal =
                unitPrice * cartItem.quantity;


            orderItems.push({
                variant_id: variant.id,
                quantity: cartItem.quantity,
                unit_price: unitPrice,
                subtotal
            });
        }


        // 4. Calculate Total
        const totalAmount = orderItems.reduce(
            (total, item) => {
                return total + item.subtotal;
            },
            0
        );


        // 5. Create Order
        const [orderResult] =
            await connection.query(
                `INSERT INTO orders
                    (user_id, total_amount, status)
                 VALUES (?, ?, 'pending')`,
                [userId, totalAmount]
            );

        const orderId =
            orderResult.insertId;


        // 6. Create Order Items
        for (const item of orderItems) {

            await connection.query(
                `INSERT INTO order_items
                    (
                        order_id,
                        variant_id,
                        quantity,
                        unit_price,
                        subtotal
                    )
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.variant_id,
                    item.quantity,
                    item.unit_price,
                    item.subtotal
                ]
            );
        }


        // 7. Reduce Stock
        for (const item of orderItems) {

            await connection.query(
                `UPDATE product_variants
                 SET stock = stock - ?
                 WHERE id = ?`,
                [
                    item.quantity,
                    item.variant_id
                ]
            );
        }


        // 8. Clear Cart
        await connection.query(
            `DELETE FROM cart_items
             WHERE cart_id = ?`,
            [cartId]
        );


        // 9. Commit
        await connection.commit();


        // 10. Get Created Order
        const [orders] =
            await connection.query(
                `SELECT
                    id,
                    user_id,
                    total_amount,
                    status,
                    created_at
                 FROM orders
                 WHERE id = ?`,
                [orderId]
            );

        return orders[0];

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }
};

const getOrdersByUser = async (userId) => {
    const [orders] = await pool.query(
        `SELECT
        id,
        user_id,
        total_amount,
        status,
        created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC`,
        [userId]
    )

    return orders;
}

const getOrderById = async (userId,orderId) => {
    const [orders] = await pool.query(
        `SELECT
        id,user_id,total_amount,status,created_at
        FROM orders
        WHERE id = ?
        AND user_id = ?`,
        [orderId,userId]
    )

    if (orders.length === 0) {
        throw new AppError(
            "Order not found",
            404
        )
    }

    const order = orders[0]

    const [items] = await pool.query(
        `SELECT
        oi.id,
        oi.order_id,
        oi.variant_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        pv.variant_name,
        p.id AS product_id,
        p.name AS product_name
        
        FROM order_items oi
        JOIN product_variants pv
        ON oi.variant_id = pv.id
        JOIN products p
        ON pv.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC`,

        [orderId]
    );

    return {
        ...order,
        items
    }
}

const getAllOrdersForAdmin = async (page, limit, status,search, sort, order) => {

    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (status) {
        conditions.push(
            "o.status = ?"
        )

        params.push(status);
    }

    if (search) {

    conditions.push(
        `(u.username LIKE ?
          OR u.email LIKE ?)`
    );

    const keyword =
        `%${search}%`;

    params.push(
        keyword,
        keyword
    );
}

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";


    const allowedSorts = {
        created_at: "o.created_at",
        total_amount: "o.total_amount",
        status: "o.status"
    };

    const sortColumn =
        allowedSorts[sort] ||
        "o.created_at";

    const sortOrder =
        order === "asc"
            ? "ASC"
            : "DESC";



    const [orders] = await pool.query(
        `SELECT
        o.id,
        o.user_id,
        u.username,
        u.email,
        o.total_amount,
        o.status,
        o.created_at
        FROM orders o
        JOIN users u
        ON o.user_id = u.id
        ${whereClause}
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT ?
        OFFSET ?`,
        [...params,limit,offset]
    )

    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
        FROM orders o
        JOIN users u
        ON o.user_id = u.id
        ${whereClause}`,
        params
    )

    const total = countRows[0].total;

    const totalPages = Math.ceil(total / limit);


    return {
        data: orders,
        pagination: { 
            page,
            limit,
            total,
            totalPages
        }
    }
}

const getOrderByIdForAdmin = async (orderId) => {

    const [orders] = await pool.query(
        `SELECT
            o.id,
            o.user_id,
            u.username,
            u.email,
            o.total_amount,
            o.status,
            o.created_at
         FROM orders o
         JOIN users u
            ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
    );

    if (orders.length === 0) {
        throw new AppError("Order not found", 404);
    }

    const order = orders[0];

    const [items] = await pool.query(
        `SELECT
            oi.id,
            oi.order_id,
            oi.variant_id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            pv.variant_name,
            p.id AS product_id,
            p.name AS product_name
         FROM order_items oi
         JOIN product_variants pv
            ON oi.variant_id = pv.id
         JOIN products p
            ON pv.product_id = p.id
         WHERE oi.order_id = ?
         ORDER BY oi.id ASC`,
        [orderId]
    );

    return {
        ...order,
        items
    };
};

const updateOrderStatus = async (orderId, newStatus) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const [orders] = await connection.query(
            `SELECT
                id,
                user_id,
                total_amount,
                status
             FROM orders
             WHERE id = ?
             FOR UPDATE`,
            [orderId]
        );

        if (orders.length === 0) {
            throw new AppError(
                "Order not found",
                404
            );
        }

        const order = orders[0];

        if (order.status !== "pending") {
            throw new AppError(
                "Only pending orders can be updated",
                400
            );
        }

        if (newStatus === "paid") {

            await connection.query(
                `UPDATE orders
                 SET status = 'paid'
                 WHERE id = ?`,
                [orderId]
            );

        } else if (newStatus === "cancelled") {

            const [items] = await connection.query(
                `SELECT
                    variant_id,
                    quantity
                 FROM order_items
                 WHERE order_id = ?
                 FOR UPDATE`,
                [orderId]
            );

            for (const item of items) {

                await connection.query(
                    `UPDATE product_variants
                     SET stock = stock + ?
                     WHERE id = ?`,
                    [
                        item.quantity,
                        item.variant_id
                    ]
                );
            }

            await connection.query(
                `UPDATE orders
                 SET status = 'cancelled'
                 WHERE id = ?`,
                [orderId]
            );
        }

        await connection.commit();

        const [updatedOrders] = await connection.query(
            `SELECT
                id,
                user_id,
                total_amount,
                status,
                created_at
             FROM orders
             WHERE id = ?`,
            [orderId]
        );

        return updatedOrders[0];

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();
    }
};



module.exports = {
    createOrder, getOrdersByUser, getOrderById, getAllOrdersForAdmin, getOrderByIdForAdmin, updateOrderStatus
};