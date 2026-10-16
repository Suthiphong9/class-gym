const AppError = require("../errors/AppError");

const validateUserId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid user ID", 400);
  }

  next();
};

const validateUpdateUser = (req, res, next) => {
  const {username,email,role} = req.body;

  if (!username || !email || !role) {
    throw new AppError(
      "Username, email and role are required",
      400
    )
  }

  const allowedRoles = [
    "user",
    "instructor",
    "admin"
  ]

  if (!allowedRoles.includes(role)) {
    throw new AppError(
      "Invalid role",
      400
    )
  }

  next();
}

module.exports = { validateUserId , validateUpdateUser};
