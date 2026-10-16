const pool = require("../config/db");
const AppError = require("../errors/AppError");

// CREATE
const createSchedule = async ({
  class_id,
  schedule_date,
  start_time,
  end_time,
}) => {
  // 1. ตรวจว่า Class มีอยู่จริง
  const [classes] = await pool.query(
    `SELECT id
         FROM classes
         WHERE id = ?`,
    [class_id],
  );

  if (classes.length === 0) {
    throw new AppError("Class not found", 404);
  }

  // 2. ตรวจเวลา
  if (start_time >= end_time) {
    throw new AppError("End time must be later than start time", 400);
  }

  // 3. สร้าง Schedule
  const [result] = await pool.query(
    `INSERT INTO class_schedules
        (
            class_id,
            schedule_date,
            start_time,
            end_time
        )
        VALUES (?, ?, ?, ?)`,
    [class_id, schedule_date, start_time, end_time],
  );

  // 4. ดึงข้อมูลที่เพิ่งสร้างกลับมา
  const [schedules] = await pool.query(
    `SELECT
            cs.id,
            cs.class_id,
            c.name AS class_name,
            cs.schedule_date,
            cs.start_time,
            cs.end_time,
            cs.created_at
         FROM class_schedules cs
         JOIN classes c
            ON cs.class_id = c.id
         WHERE cs.id = ?`,
    [result.insertId],
  );

  if (schedules.length === 0) {
    throw new AppError("Schedule not found", 404);
  }

  return schedules[0];
};

// GET ALL
const getAllSchedules = async () => {
  const [schedules] = await pool.query(
    `SELECT
            cs.id,
            cs.class_id,
            c.name AS class_name,
            cs.schedule_date,
            cs.start_time,
            cs.end_time,
            cs.created_at
         FROM class_schedules cs
         JOIN classes c
            ON cs.class_id = c.id
         ORDER BY
            cs.schedule_date ASC,
            cs.start_time ASC`,
  );

  return schedules;
};

// GET BY ID
const getScheduleById = async (id) => {
  const [schedules] = await pool.query(
    `SELECT
            cs.id,
            cs.class_id,
            c.name AS class_name,
            cs.schedule_date,
            cs.start_time,
            cs.end_time,
            cs.created_at
         FROM class_schedules cs
         JOIN classes c
            ON cs.class_id = c.id
         WHERE cs.id = ?`,
    [id],
  );

  if (schedules.length === 0) {
    throw new AppError("Schedule not found", 404);
  }

  return schedules[0];
};

// UPDATE
const updateSchedule = async (
  id,
  { class_id, schedule_date, start_time, end_time },
) => {
  // 1. ตรวจว่า Schedule มีอยู่จริง
  const [schedules] = await pool.query(
    `SELECT id
         FROM class_schedules
         WHERE id = ?`,
    [id],
  );

  if (schedules.length === 0) {
    throw new AppError("Schedule not found", 404);
  }

  // 2. ตรวจว่า Class มีอยู่จริง
  const [classes] = await pool.query(
    `SELECT id
         FROM classes
         WHERE id = ?`,
    [class_id],
  );

  if (classes.length === 0) {
    throw new AppError("Class not found", 404);
  }

  // 3. ตรวจเวลา
  if (start_time >= end_time) {
    throw new AppError("End time must be later than start time", 400);
  }

  // 4. UPDATE
  await pool.query(
    `UPDATE class_schedules
         SET
            class_id = ?,
            schedule_date = ?,
            start_time = ?,
            end_time = ?
         WHERE id = ?`,
    [class_id, schedule_date, start_time, end_time, id],
  );

  // 5. ดึงข้อมูลหลัง UPDATE
  const [updatedSchedules] = await pool.query(
    `SELECT
            cs.id,
            cs.class_id,
            c.name AS class_name,
            cs.schedule_date,
            cs.start_time,
            cs.end_time,
            cs.created_at
         FROM class_schedules cs
         JOIN classes c
            ON cs.class_id = c.id
         WHERE cs.id = ?`,
    [id],
  );

  return updatedSchedules[0];
};

// DELETE
const deleteSchedule = async (id) => {
  //ตรวจว่ามี Schedule หรือไม่
  const [schedules] = await pool.query(
    `SELECT id
         FROM class_schedules
         WHERE id = ?`,
    [id],
  );


  if (schedules.length === 0) {
    throw new AppError("Schedule not found", 404);
  }

  const [bookings] = await pool.query(
        `SELECT id
         FROM bookings
         WHERE schedule_id = ?`,
        [id]
    );

    if (bookings.length > 0) {
        throw new AppError(
            "Cannot delete schedule because it has bookings",
            400
        );
    }


  await pool.query(
    `DELETE FROM class_schedules
         WHERE id = ?`,
    [id],
  );

  return true;
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
