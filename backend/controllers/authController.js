const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message === "Username, email and password are required" ||
      error.message === "Username or email already exists"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message === "Email and password are required" ||
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { register, login };
