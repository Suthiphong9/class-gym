const AppError = require("../errors/AppError");

const validateCreateMembership = (req, res, next) => {
  const { plan_id } = req.body;

  const planId = Number(plan_id);

  if (!Number.isInteger(planId) || planId <= 0) {
    throw new AppError("Invalid plan ID", 400);
  }

  next();
};

const validateMembershipId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid membership ID", 400);
  }

  next();
};

const validateMembershipStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  const allowedStatuses = ["cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid membership status", 400);
  }

  next();
};

const validateCreatePlan = (req, res, next) => {
  const { name, price, duration_days } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new AppError("Plan name is required", 400);
  }

  const planPrice = Number(price);
  const durationDays = Number(duration_days);

  if (!Number.isFinite(planPrice) || planPrice > 0) {
    throw new AppError("Invalid plan price", 400);
  }

  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    throw new AppError("Invalid duration days", 400);
  }

  next();
};

const validateUpdatePlan = (req, res, next) => {
  const { name, price, duration_days } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new AppError("Plan name is required", 400);
  }

  const planPrice = Number(price);
  const durationDays = Number(duration_days);

  if (!Number.isFinite(planPrice) || planPrice < 0) {
    throw new AppError("Invalid plan price", 400);
  }

  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    throw new AppError("Invalid duration days", 400);
  }

  next();
};

const validatePlanStatus = (req, res, next) => {
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    throw new AppError("is_active must be a boolean", 400);
  }

  next();
};

module.exports = {
  validateCreateMembership,
  validateMembershipId,
  validateMembershipStatus,
  validateCreatePlan,
  validateUpdatePlan,
  validatePlanStatus,
};
