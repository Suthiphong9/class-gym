const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const crypto = require("crypto");
const AppError = require("../errors/AppError");

const register = async ({ username, email, password }) => {
  // ตรวจสอบ User ซ้ำ
  const [existingUsers] = await pool.query(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [username, email],
  );

  if (existingUsers.length > 0) {
    throw new AppError("Username or email already exists", 409);
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // บันทึกลง Database
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password)
         VALUES (?, ?, ?)`,
    [username, email, hashedPassword],
  );

  // คืนข้อมูล User
  return {
    id: result.insertId,
    username,
    email,
  };
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const login = async ({ email, password }) => {
  const [users] = await pool.query(
    `SELECT id, username, email, password, role
         FROM users
         WHERE email = ?
         AND is_deleted = FALSE`,
    [email],
  );

  if (users.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = users[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");
  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO refresh_tokens
     (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [user.id, refreshTokenHash, expiresAt],
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const tokenHash = hashToken(refreshToken);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT
            rt.id,
            rt.user_id,
            rt.expires_at,
            rt.revoked_at,
            u.username,
            u.email,
            u.role
         FROM refresh_tokens rt
         JOIN users u
            ON rt.user_id = u.id
         WHERE rt.token_hash = ?
         AND u.is_deleted = FALSE`,
      [tokenHash],
    );

    if (rows.length === 0) {
      throw new AppError("Invalid refresh token", 401);
    }

    const token = rows[0];

    if (token.revoked_at !== null) {
      throw new AppError("Refresh token has been revoked", 401);
    }

    if (new Date(token.expires_at) < new Date()) {
      throw new AppError("Refresh token has expired", 401);
    }

    await connection.query(
      `UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = ?`,
      [token.id],
    );

    const accessToken = jwt.sign(
      {
        id: token.user_id,
        username: token.username,
        email: token.email,
        role: token.role,
      },
      env.jwtSecret,
      {
        expiresIn: "15m",
      },
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenHash = hashToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await connection.query(
      `INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)`,
      [token.user_id, newRefreshTokenHash, expiresAt],
    );

    await connection.commit();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const tokenHash = hashToken(refreshToken);

  const [result] = await pool.query(
    `UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = ?
        AND revoked_at IS NULL`,
    [tokenHash],
  );

  if (result.affectedRows === 0) {
    throw new AppError("Invalid refresh token", 401);
  }

  return true;
};

module.exports = { register, login, refresh, logout };
