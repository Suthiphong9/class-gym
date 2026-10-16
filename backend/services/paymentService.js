const pool = require("../config/db");
const AppError = require("../errors/AppError");

const createPayment = async (userId, orderId, paymentMethod, slipUrl) => {
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
      [orderId],
    );

    if (orders.length === 0) {
      throw new AppError("Order not found", 404);
    }

    const order = orders[0];

    if (order.user_id !== userId) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "pending") {
      throw new AppError("Only pending orders can be paid", 400);
    }

    const [existingPayments] = await connection.query(
      `SELECT
                id,
                status
                 FROM payments
                 WHERE order_id = ?
                 AND status IN ('pending', 'verified')
                 FOR UPDATE`,
      [orderId],
    );

    if (existingPayments.length > 0) {
      throw new AppError("Payment is already being processed", 400);
    }

    const amount = order.total_amount;

    const [result] = await connection.query(
      `INSERT INTO payments
                (
                    order_id,
                    payment_method,
                    amount,
                    slip_url,
                    status
                )
             VALUES (?, ?, ?, ?, 'pending')`,
      [orderId, paymentMethod, amount, slipUrl || null],
    );

    await connection.commit();

    const [payments] = await connection.query(
      `SELECT
                id,
                order_id,
                payment_method,
                amount,
                slip_url,
                status,
                paid_at,
                created_at
             FROM payments
             WHERE id = ?`,
      [result.insertId],
    );

    return payments[0];
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

const getAllPaymentsForAdmin = async () => {
  const [payments] = await pool.query(
    `SELECT
            p.id,
            p.order_id,
            p.payment_method,
            p.amount,
            p.slip_url,
            p.status,
            p.paid_at,
            p.created_at,

            o.user_id,

            u.username,
            u.email

         FROM payments p

         JOIN orders o
            ON p.order_id = o.id

         JOIN users u
            ON o.user_id = u.id

         ORDER BY p.created_at DESC`,
  );

  return payments;
};

const getPaymentByIdForAdmin = async (paymentId) => {
  const [payments] = await pool.query(
    `SELECT
            p.id,
            p.order_id,
            p.payment_method,
            p.amount,
            p.slip_url,
            p.status,
            p.paid_at,
            p.created_at,

            o.user_id,

            u.username,
            u.email,

            o.total_amount AS order_total_amount,
            o.status AS order_status

         FROM payments p

         JOIN orders o
            ON p.order_id = o.id

         JOIN users u
            ON o.user_id = u.id

         WHERE p.id = ?`,
    [paymentId],
  );

  if (payments.length === 0) {
    throw new AppError("Payment not found", 404);
  }

  return payments[0];
};

const updatePaymentStatus = async (paymentId, newStatus) => {

  const allowedStatuses = [
        "verified",
        "rejected"
    ];

    if (!allowedStatuses.includes(newStatus)) {
        throw new AppError(
            "Invalid payment status",
            400
        );
    }

    
  const connection = await pool.getConnection();
  try {
    

    await connection.beginTransaction();

    const [payments] = await connection.query(
      `SELECT
            id,
            order_id,
            amount,
            status
            FROM payments
            WHERE id = ?
            FOR UPDATE`,
      [paymentId],
    );

    if (payments.length === 0) {
      throw new AppError("Payment not found", 404);
    }

    const payment = payments[0];

    if (payment.status !== "pending") {
      throw new AppError("Only pending payments can be updated", 400);
    }

    const [orders] = await connection.query(
      `SELECT
            id,
            total_amount,
            status
            FROM orders
            WHERE id = ?
            FOR UPDATE`,
      [payment.order_id],
    );

    if (orders.length === 0) {
      throw new AppError("Order not found", 404);
    }

    const order = orders[0];

    if (order.status !== "pending") {
      throw new AppError("Only pending orders can be paid", 400);
    }

    if (Number(payment.amount) !== Number(order.total_amount)) {
      throw new AppError("Payment amount does not match order total", 400);
    }

    if (newStatus === "verified") {
      await connection.query(
        `UPDATE payments
                SET status = 'verified',
                paid_at = NOW()
                WHERE id = ?`,
        [paymentId],
      );

      await connection.query(
        `UPDATE orders
                SET status = 'paid'
                WHERE id = ?`,
        [payment.order_id],
      );
    } else if (newStatus === "rejected") {
      await connection.query(
        `UPDATE payments
                SET status = 'rejected'
                WHERE id = ?`,
        [paymentId],
      );
    }

    await connection.commit();

    const [updatedPayments] = await connection.query(
      `SELECT
            id,
            order_id,
            payment_method,
            amount,
            slip_url,
            status,
            paid_at,
            created_at
            FROM payments
            WHERE id = ?`,
      [paymentId],
    );

    return updatedPayments[0];
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

const getPaymentsByUserId = async (userId) => {
  const [payments] = await pool.query(
    `SELECT
            p.id,
            p.order_id,
            p.payment_method,
            p.amount,
            p.slip_url,
            p.status,
            p.paid_at,
            p.created_at
         FROM payments p
         JOIN orders o
            ON p.order_id = o.id
         WHERE o.user_id = ?
         ORDER BY p.created_at DESC`,
    [userId],
  );

  return payments;
};

const getPaymentById = async (
    paymentId,
    userId
) => {
    const [payments] = await pool.query(
        `SELECT
            p.id,
            p.order_id,
            p.payment_method,
            p.amount,
            p.slip_url,
            p.status,
            p.paid_at,
            p.created_at
         FROM payments p
         JOIN orders o
            ON p.order_id = o.id
         WHERE p.id = ?
         AND o.user_id = ?`,
        [
            paymentId,
            userId
        ]
    );

    if (payments.length === 0) {
        throw new AppError(
            "Payment not found",
            404
        );
    }

    return payments[0];
};


const getPaymentSlipPath = async (
    paymentId,
    userId
) => {

    const [payments] = await pool.query(
        `SELECT
            p.id,
            p.slip_url
         FROM payments p

         JOIN orders o
            ON p.order_id = o.id

         WHERE p.id = ?
         AND o.user_id = ?`,
        [
            paymentId,
            userId
        ]
    );

    if (payments.length === 0) {
        throw new AppError(
            "Payment not found",
            404
        );
    }

    const payment = payments[0];

    if (!payment.slip_url) {
        throw new AppError(
            "Payment slip not found",
            404
        );
    }

    return payment.slip_url;
};

const getPaymentSlipPathForAdmin =
    async (paymentId) => {

        const [payments] =
            await pool.query(
                `SELECT
                    id,
                    slip_url
                 FROM payments
                 WHERE id = ?`,
                [paymentId]
            );

        if (payments.length === 0) {
            throw new AppError(
                "Payment not found",
                404
            );
        }

        const payment = payments[0];

        if (!payment.slip_url) {
            throw new AppError(
                "Payment slip not found",
                404
            );
        }

        return payment.slip_url;
    };


module.exports = {
  createPayment,
  getAllPaymentsForAdmin,
  getPaymentByIdForAdmin,
  updatePaymentStatus,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentSlipPath,
  getPaymentSlipPathForAdmin
};
