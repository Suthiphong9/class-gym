const pool = require("../config/db");
const AppError = require("../errors/AppError");

const createBooking = async (userId, scheduleId) => {
  const connection = await pool.getConnection();

  try {
    // 1. เริ่ม Transaction
    await connection.beginTransaction();

    // 2. ตรวจสอบ Schedule และ Lock
    const [schedules] = await connection.query(
      `SELECT
                cs.id,
                cs.class_id,
                c.name AS class_name,
                c.capacity
             FROM class_schedules cs
             JOIN classes c
                ON cs.class_id = c.id
             WHERE cs.id = ?
             FOR UPDATE`,
      [scheduleId],
    );

    if (schedules.length === 0) {
      throw new AppError("Schedule not found", 404);
    }

    const schedule = schedules[0];

    // 3. ตรวจสอบว่า User จอง Schedule นี้แล้วหรือยัง
    const [existingBookings] = await connection.query(
      `SELECT id
             FROM bookings
             WHERE user_id = ?
             AND schedule_id = ?
             AND status = 'confirmed'`,
      [userId, scheduleId],
    );

    if (existingBookings.length > 0) {
      throw new AppError("You have already booked this schedule", 400);
    }

    // 4. นับจำนวนคนที่จองอยู่
    const [bookingCount] = await connection.query(
      `SELECT COUNT(*) AS total
             FROM bookings
             WHERE schedule_id = ?
             AND status = 'confirmed'`,
      [scheduleId],
    );

    const totalBookings = Number(bookingCount[0].total);

    // 5. ตรวจสอบ Capacity
    if (totalBookings >= schedule.capacity) {
      throw new AppError("Class schedule is full", 400);
    }

    // 6. สร้าง Booking
    const [result] = await connection.query(
      `INSERT INTO bookings
            (
                user_id,
                schedule_id,
                status
            )
            VALUES (?, ?, 'confirmed')`,
      [userId, scheduleId],
    );

    // 7. ดึง Booking ที่เพิ่งสร้าง
    const [bookings] = await connection.query(
      `SELECT
                b.id,
                b.user_id,
                b.schedule_id,
                b.status,
                b.booked_at,
                b.cancelled_at,
                cs.schedule_date,
                cs.start_time,
                cs.end_time,
                c.name AS class_name
             FROM bookings b
             JOIN class_schedules cs
                ON b.schedule_id = cs.id
             JOIN classes c
                ON cs.class_id = c.id
             WHERE b.id = ?`,
      [result.insertId],
    );

    // 8. Commit
    await connection.commit();

    return bookings[0];
  } catch (error) {
    // ถ้าเกิด Error → ย้อนกลับทุก SQL
    await connection.rollback();

    throw error;
  } finally {
    // คืน Connection ให้ Pool
    connection.release();
  }
};

const getMyBookings = async (userId) => {
  const [bookings] = await pool.query(
    `SELECT
        b.id,
        b.user_id,
        b.schedule_id,
        b.status,
        b.booked_at,
        b.cancelled_at,
        cs.schedule_date,
        cs.start_time,
        cs.end_time,
        c.id AS class_id,
        c.name AS class_name,
        i.id AS instructor_id,
        i.name AS instructor_name
        
        FROM bookings b
        
        JOIN class_schedules cs
        ON b.schedule_id = cs.id
        
        JOIN classes c
        ON cs.class_id = c.id
        
        JOIN instructors i
        ON c.instructor_id = i.id
        
        WHERE b.user_id = ?
        
        ORDER BY
        cs.schedule_date ASC,
        cs.start_time ASC`,
    [userId],
  );
  return bookings;
};

const getBookingById = async (bookingId, userId) => {
  const [bookings] = await pool.query(
    `SELECT
    b.id,
    b.user_id,
    b.schedule_id,
    b.status,
    b.booked_at,
    b.cancelled_at,
    cs.schedule_date,
    cs.start_time,
    cs.end_time,
    c.id AS class_id,
    c.name AS class_name,
    c.description AS class_description,
    i.id AS instructor_id,
    i.name AS instructor_name,
    i.specialization
    
    FROM bookings b
    
    JOIN class_schedules cs
    ON b.schedule_id = cs.id
    
    JOIN classes c
    ON cs.class_id = c.id
    
    JOIN instructors i
    ON c.instructor_id = i.id
    
    WHERE b.id = ?
    AND b.user_id = ?`,
    [bookingId, userId],
  );

  if (bookings.length === 0) {
    throw new AppError("Booking not found", 404);
  }
  return bookings[0];
};

const cancelBooking = async (bookingId, userId) => {

    const [bookings] = await pool.query(
        `SELECT
        id,
        user_id,
        status
        FROM bookings
        WHERE id = ?
        AND user_id = ?`,
        [bookingId,userId]
    )

    if (bookings.length === 0) {

        throw new AppError(
            "Booking not found",
            404
        );

    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {

        throw new AppError(
            "Booking is already cancelled",
            400
        );

    }

    await pool.query(
        `UPDATE bookings
        SET
        status = 'cancelled',
        cancelled_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND user_id = ?`,
        [bookingId, userId]
    )
    return true;
}

const getAllBookings = async () => {

    const [bookings] = await pool.query(
        `SELECT
            b.id,
            b.user_id,
            u.username,
            u.email,

            b.schedule_id,
            b.status,
            b.booked_at,
            b.cancelled_at,

            cs.schedule_date,
            cs.start_time,
            cs.end_time,

            c.id AS class_id,
            c.name AS class_name,

            i.id AS instructor_id,
            i.name AS instructor_name

         FROM bookings b

         JOIN users u
            ON b.user_id = u.id

         JOIN class_schedules cs
            ON b.schedule_id = cs.id

         JOIN classes c
            ON cs.class_id = c.id

         JOIN instructors i
            ON c.instructor_id = i.id

         ORDER BY
            cs.schedule_date ASC,
            cs.start_time ASC,
            b.booked_at ASC`
    );

    return bookings;
};

const getBookingByIdForAdmin = async (bookingId) => {

    const [bookings] = await pool.query(
        `SELECT
            b.id,
            b.user_id,
            u.username,
            u.email,

            b.schedule_id,
            b.status,
            b.booked_at,
            b.cancelled_at,

            cs.schedule_date,
            cs.start_time,
            cs.end_time,

            c.id AS class_id,
            c.name AS class_name,
            c.description AS class_description,

            i.id AS instructor_id,
            i.name AS instructor_name,
            i.specialization

         FROM bookings b

         JOIN users u
            ON b.user_id = u.id

         JOIN class_schedules cs
            ON b.schedule_id = cs.id

         JOIN classes c
            ON cs.class_id = c.id

         JOIN instructors i
            ON c.instructor_id = i.id

         WHERE b.id = ?`,
        [bookingId]
    );

    if (bookings.length === 0) {
        throw new AppError(
            "Booking not found",
            404
        );
    }

    return bookings[0];
};
const updateBookingStatus = async (
    bookingId,
    status
) => {

    const [bookings] = await pool.query(
        `SELECT
            id,
            status
         FROM bookings
         WHERE id = ?`,
        [bookingId]
    );

    if (bookings.length === 0) {
        throw new AppError(
            "Booking not found",
            404
        );
    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {
        throw new AppError(
            "Booking is already cancelled",
            400
        );
    }

    await pool.query(
        `UPDATE bookings
         SET
            status = ?,
            cancelled_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
            status,
            bookingId
        ]
    );

    return true;
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  getBookingByIdForAdmin,
  updateBookingStatus
};
