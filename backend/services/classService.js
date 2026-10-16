const pool = require("../config/db")
const AppError = require("../errors/AppError")

const createClass = async ({name,description,instructor_id,capacity,duration_minutes}) => {
    const [instructors] = await pool.query(
        `SELECT id
        FROM instructors
        WHERE id = ?`,
        [instructor_id]
    );

    if (instructors.length === 0) {
        throw new AppError(
            "Instructor not found",
            404
        )
    }

    const [result] = await pool.query(
        `INSERT INTO classes
        (name, description, instructor_id, capacity, duration_minutes)
        VALUES (?, ?, ?, ?, ?)`,
        [name, description || null, instructor_id, capacity, duration_minutes]
    )

    const [classes] = await pool.query(
        `SELECT
        c.id,
        c.name,
        c.description,
        c.instructor_id,
        c.capacity,
        c.duration_minutes,
        i.name AS instructor_name
        FROM classes c
        JOIN instructors i
        ON c.instructor_id = i.id
        WHERE c.id = ?`,
        [result.insertId]
    )

    if (classes.length === 0) {
        throw new AppError(
            "Class not found",
            404
        )
    }

    return classes[0];
}

const getAllClasses = async () => {
    const [classes] = await pool.query(
        `SELECT
        c.id,
        c.name,
        c.description,
        c.capacity,
        c.duration_minutes,
        c.created_at,
        i.id AS instructor_id,
        i.name AS instructor_name,
        i.specialization
        FROM classes c
        JOIN instructors i
        ON c.instructor_id = i.id
        ORDER BY c.id DESC`
    )
    return classes;
}

const getClassById = async (id) => {
    const [classes] = await pool.query(
        `SELECT
        c.id,
        c.name,
        c.description,
        c.capacity,
        c.duration_minutes,
        c.created_at,
        i.id AS instructor_id,
        i.name AS instructor_name,
        i.specialization
        FROM classes c
        JOIN instructors i
        ON c.instructor_id = i.id
        WHERE c.id = ?`,
        [id]
    )


    if (classes.length === 0) {
        throw new AppError(
            "Class not found",
            404
        )
    }
    return classes[0]
}

const updateClass = async (id,{name,description,instructor_id,capacity,duration_minutes}) => {
    const [classes] = await pool.query(
        `SELECT id
        FROM classes
        WHERE id = ?`,
        [id]
    )

    if(classes.length === 0) {
        throw new AppError(
            "Class not found",
            404
        )
    }

    const [instructors] = await pool.query(
        `SELECT id
        FROM instructors
        WHERE id = ?`,
        [instructor_id]
    )

    if (instructors.length === 0) {
        throw new AppError(
            "Instructor not found",
            404
        )
    }

    await pool.query(
        `UPDATE classes
        SET
            name = ?,
            description = ?,
            instructor_id = ?,
            capacity = ?,
            duration_minutes = ?
        WHERE id = ?`,
        [name,description,instructor_id,capacity,duration_minutes,id]
    )

    const [updatedClasses] = await pool.query(
        `SELECT
        c.id,
        c.name,
        c.description,
        c.capacity,
        c.duration_minutes,
        c.created_at,
        i.id AS instructor_id,
        i.name AS instructor_name,
        i.specialization
        FROM classes c
        JOIN instructors i
        ON c.instructor_id = i.id
        WHERE c.id = ?`,
        [id]
    )
    return updatedClasses[0]
}

const deleteClass = async (id) => {
    const [classes] = await pool.query(
        `SELECT id
        FROM classes
        WHERE id = ?`,
        [id]
    )

    if (classes.length === 0) {
        throw new AppError(
            "Class not found",
            404
        )
    }

    const [schedules] = await pool.query(
        `SELECT id
        FROM schedules
        WHERE class_id = ?`,
        [id]
    )    

    if (schedules.length > 0) {
        throw new AppError("Cannot delete calss because it has schedules",400)
    }
    
    await pool.query(
        `DELETE FROM classes
        WHERE id = ?`,
        [id]
    )
    return true;
}

module.exports = {createClass, getAllClasses, getClassById, updateClass, deleteClass}