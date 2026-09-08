const express = require("express")
const cors = require("cors")
require("dotenv").config();

const pool = require("./config/db")
const authRoutes = require("./routes/authRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TEST 456"
    });
});

app.get("/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            message: "Database connected",
            data: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on prot ${PORT}`);
});