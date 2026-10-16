const pool = require("../config/db");
const AppError = require("../errors/AppError");

const createInstructor = async ({ name, bio, specialization }) => {

  const [result] = await pool.query(
    `INSERT INTO instructors (name, bio, specialization)
        VALUES (?, ?, ?)`,
    [name, bio || null, specialization],
  );

  const [instructors] = await pool.query(
    `SELECT id, name, bio, specialization, created_at
        FROM instructors
        WHERE id = ?`,
    [result.insertId],
  );


  return instructors[0];
};

const getAllInstructors = async () => {
  const [instructors] = await pool.query(
    `SELECT id,name,bio,specialization,created_at
        FROM instructors
        ORDER BY id DESC`,
  );

  return instructors;
};

const getInstructorById = async (id) => {
  const [instructors] = await pool.query(
    `SELECT id, name, bio, specialization, created_at
        FROM instructors
        WHERE id = ?`,
    [id],
  );

  if (instructors.length === 0) {
    throw new AppError("Instructor not found", 404);
  }

  return instructors[0];
};

const updateInstructor = async (id, { name, bio, specialization }) => {
  const [instructors] = await pool.query(
    `SELECT id
        FROM instructors
        WHERE id = ?`,
    [id],
  );
  if (instructors.length === 0) {
    throw new AppError("Instructor not found", 404);
  }

  await pool.query(
    `UPDATE instructors
        SET name = ?, bio = ?, specialization = ?
        WHERE id = ?`,
    [name, bio || null, specialization, id],
  );

  const [updatedInstructors] = await pool.query(
    `SELECT id, name, bio, specialization, created_at
        FROM instructors
        WHERE id = ?`,
    [id],
  );

  return updatedInstructors[0];
};

const deleteInstructor = async (id) => {
  const [instructors] = await pool.query(
    `SELECT id FROM instructors
        WHERE id = ?`,
    [id],
  );

  if (instructors.length === 0) {
    throw new AppError("Instructor not found", 404);
  }

  const [classes] = await pool.query(
    `SELECT id
        FROM classes
        WHERE instructor_id = ?`,
    [id],
  );

  if (classes.length > 0) {
    throw new AppError(
      "Cannot delete instructor because they have classes",
      400,
    );
  }

  await pool.query(
    `DELETE FROM instructors
    WHERE id = ?`,
    [id],
  );

  return true;
};

module.exports = {
  createInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor
};
