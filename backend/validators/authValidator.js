const AppError = require("../errors/AppError");

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  next();
};

const validateRegister = (req,res,next) => {
    const { username, email, password} = req.body;

    if (!username || !email || !password) {
        throw new AppError("Username, email and password are required", 400)
    }

    next();
}

module.exports = {
  validateLogin, validateRegister
};
