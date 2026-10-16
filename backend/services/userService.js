const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const AppError = require("../errors/AppError");

const getProfile = async (userId) => {
  const [users] = await pool.query(
    `SELECT id,username,email,created_at FROM users WHERE id = ?`,
    [userId],
  );

  if (users.length === 0) {
    throw new AppError("User not found",404);
  }

  return users[0];
};


const updateProfile = async (userId, { username, email }) => {
  if (!username || !email) {
    throw new AppError("Username and email are required",400);
  }

  const [existingUsers] = await pool.query(
    `SELECT id
         FROM users
         WHERE (username = ? OR email = ?)
         AND id != ?,
         AND is_deleted = 0`,
    [username, email, userId],
  );

    if (existingUsers.length > 0) {
    throw new AppError("Username or email already exists",409);
  }

  const [result] = await pool.query(
    `UPDATE users
        SET username = ?, email = ?
        WHERE id = ?
        AND is_deleted = 0`,
        [username, email, userId]
  );

  if (result.affectedRows === 0) {
    throw new AppError("User not found",404);
  }

  const [users] = await pool.query(
    `SELECT id, username, email, created_at
    FROM users
    WHERE id = ?`,
    [userId]
  )

  return users[0]
};

const changePassword = async (userId, {currentPassword, newPassword}) => {
    if (!currentPassword || !newPassword) {
        throw new AppError(
            "Current password and new password are required",
            400
        );
    }

    const [users] = await pool.query(
        `SELECT id, password
        FROM users
        WHERE id = ?,
        AND is_deleted = 0`,
        [userId]
    )

    if (users.length === 0 ) {
        throw new AppError("User not found",404);
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
    )

    if (!isPasswordValid) {
        throw new AppError("Current password is incorrect",401)
    }

    const hashedPassword = await bcrypt.hash(newPassword,10)

    await pool.query(
        `UPDATE users
        SET password = ?
        WHERE id = ?`,
        [hashedPassword, userId]
    )
}

const getAllUsers = async () => {

  const [users] = await pool.query(
    `SELECT id, username, email, role, created_at
    FROM users WHERE is_deleted = 0 
    ORDER BY id DESC`
  );

  return users;
}

const getUserById = async (id) => {
  const [users] = await pool.query(
    `SELECT id, username, email, role, created_at
    FROM users WHERE id = ?
    AND is_deleted = 0`,
    [id]
  )

  if (users.length === 0) {
    throw new AppError(
      "User not found",
      404
    )
  }

  return users[0]
}


const updateUser = async (id, { username, email, role }) => {
  const [users] = await pool.query(
    `SELECT id
    FROM users
    WHERE id = ?
    AND is_deleted = 0`,
    [id]
  )

  if (users.length === 0 ) {
    throw new AppError(
      "User not found",
      404
    )
  }

  const [existingUsers] = await pool.query(
    `SELECT id
    FROM users
    WHERE (username = ? OR email = ?)
    AND id != ?
    AND is_deleted = 0`,
    [username, email, id]
  )

      if (existingUsers.length > 0) {
        throw new AppError(
            "Username or email already exists",
            400
        );
    }

    await pool.query(
      `UPDATE users
      SET username = ?,
      email = ?,
      role = ?
      WHERE id = ?`,
      [username, email, role, id]
    )

    const [updatedUsers] = await pool.query(
      `SELECT id, username, email, role, created_at
      FROM users
      WHERE id = ?`,
      [id]
    );

    return updatedUsers[0];

}

const deleteUser = async (id, currentUserId) =>{

  if (id === currentUserId) {
        throw new AppError(
            "Admin cannot delete themselves",
            400
        );
    }


  const [users] = await pool.query(
    `SELECT id
    FROM users
    WHERE id = ?
    AND is_deleted = 0`,
    [id]
  )

  if (users.length === 0) {
    throw new AppError(
      "User not found",
      404
    )
  }


  await pool.query(
    `UPDATE users
    SET is_deleted = 1
    WHERE id = ?`,
    [id]
  )

  return true;
}

const getDeletedUsers = async () => {

    const [users] = await pool.query(
        `SELECT
            id,
            username,
            email,
            role,
            created_at
         FROM users
         WHERE is_deleted = 1
         ORDER BY created_at DESC`
    );

    return users;
};

const restoreUser = async (id) => {

    const [users] = await pool.query(
        `SELECT id
         FROM users
         WHERE id = ?
         AND is_deleted = 1`,
        [id]
    );

    if (users.length === 0) {
        throw new AppError(
            "Deleted user not found",
            404
        );
    }

    await pool.query(
        `UPDATE users
         SET is_deleted = 0
         WHERE id = ?`,
        [id]
    );

    return true;
};



module.exports = { getProfile , updateProfile, changePassword, getAllUsers, getUserById, updateUser, deleteUser,getDeletedUsers ,restoreUser};
