const userService = require("../services/userService");

const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);

    res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message === "Username and email are required" ||
      error.message === "Username or email already exists"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.message === "User not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
module.exports = { getProfile , updateProfile};
