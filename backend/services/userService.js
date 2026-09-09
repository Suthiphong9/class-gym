const pool = require("../config/db");

const getProfile = async (userId) => {
  const [users] = await pool.query(
    `SELECT id,username,email,created_at FROM users WHERE id = ?`,
    [userId],
  );

  if (users.length === 0) {
    throw new Error("User not found");
  }

  return users[0];
};

const updateProfile = async (userId, { username, email }) => {
  if (!username || !email) {
    throw new Error("Username and email are required");
  }

  const [existingUsers] = await pool.query(
    `SELECT id
         FROM users
         WHERE (username = ? OR email = ?)
         AND id != ?`,
    [username, email, userId],
  );

    if (existingUsers.length > 0) {
    throw new Error("Username or email already exists");
  }

  const [result] = await pool.query(
    `UPDATE users
        SET username = ?, email = ?
        WHERE id = ?`,
        [username, email, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }

  const [users] = await pool.query(
    `SELECT id, username, email, created_at
    FROM users
    WHERE id = ?`,
    [userId]
  )

  return users[0]
};

module.exports = { getProfile , updateProfile};
