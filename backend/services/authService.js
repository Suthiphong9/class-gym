const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");


const register = async ({username, email, password}) => {

    // ตรวจสอบข้อมูล
    if (!username || !email || !password) {
        throw new Error("Username, email and password are required");
    }

    // ตรวจสอบ User ซ้ำ
    const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
    );

    if (existingUsers.length > 0) {
        throw new Error("Username or email already exists")
    }


    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);


    // บันทึกลง Database
    const [result] = await pool.query(
        `INSERT INTO users (username, email, password)
         VALUES (?, ?, ?)`,
         [username, email, hashedPassword]
    )

    // คืนข้อมูล User
    return {
        id: result.insertId,
        username,
        email
    }
}

const login = async ({email, password}) => {
    if (!email || !password) {
        throw new Error ("Email and password are required")
    }

    const [users] = await pool.query(
        `SELECT id, username, email, password
         FROM users
         WHERE email = ?`,
         [email]
    )

    if (users.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = users[0]

    const isPasswordValid = await bcrypt.compare(
        password, user.password
    )

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id:user.id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },
        token
    }
}

module.exports = { register , login}