
const pool = require("../config/db");

const closePool = async () => {
  await pool.end();
};

module.exports = closePool;
