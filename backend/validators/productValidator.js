const AppError = require("../errors/AppError");

const validateProductId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid product ID", 400);
  }

  next();
};

const validateCreateProduct = (req, res, next) => {
  const { name, description, category } = req.body;

  // description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    throw new AppError("Invalid description", 400);
  }

  // category
  if (
    category !== undefined &&
    category !== null &&
    typeof category !== "string"
  ) {
    throw new AppError("Invalid category", 400);
  }

  next();
};

const validateUpdateProduct = (req, res, next) => {
  const { name, description, category } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new AppError("Product name is required", 400);
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    throw new AppError("Invalid description", 400);
  }

  if (
    category !== undefined &&
    category !== null &&
    typeof category !== "string"
  ) {
    throw new AppError("Invalid category", 400);
  }

  next();
};

const validateProductStatus = (req, res, next) => {
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    throw new AppError("is_active must be a boolean", 400);
  }

  next();
};

const validateCreateVariant = (req, res, next) => {
  const { variant_name, price, stock } = req.body;

  // Variant name
  if (
    !variant_name ||
    typeof variant_name !== "string" ||
    variant_name.trim() === ""
  ) {
    throw new AppError("Variant name is required", 400);
  }

  // Price
  const variantPrice = Number(price);

  if (!Number.isFinite(variantPrice) || variantPrice < 0) {
    throw new AppError("Invalid variant price", 400);
  }

  // Stock
  const variantStock = Number(stock);

  if (!Number.isInteger(variantStock) || variantStock < 0) {
    throw new AppError("Invalid stock", 400);
  }

  next();
};

const validateProductIdParam = (req, res, next) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError("Invalid product ID", 400);
  }

  next();
};

const validateVariantId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid variant ID", 400);
  }

  next();
};

const validateUpdateVariant = (req, res, next) => {
  const { variant_name, price, stock } = req.body;

  // Variant name
  if (
    !variant_name ||
    typeof variant_name !== "string" ||
    variant_name.trim() === ""
  ) {
    throw new AppError("Variant name is required", 400);
  }

  // Price
  const variantPrice = Number(price);

  if (!Number.isFinite(variantPrice) || variantPrice < 0) {
    throw new AppError("Invalid variant price", 400);
  }

  // Stock
  const variantStock = Number(stock);

  if (!Number.isInteger(variantStock) || variantStock < 0) {
    throw new AppError("Invalid stock", 400);
  }

  next();
};

const validateVariantStatus = (req, res, next) => {
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    throw new AppError("is_active must be a boolean", 400);
  }

  next();
};

module.exports = {
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductStatus,
  validateCreateVariant,
  validateProductIdParam,
  validateVariantId,
  validateUpdateVariant,
  validateVariantStatus
};
