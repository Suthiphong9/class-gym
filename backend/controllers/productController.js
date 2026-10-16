const productService = require("../services/productService");
const {successResponse} = require("../utils/response")
const getActiveProducts = async (req, res, next) => {
  try {
    const products = await productService.getActiveProducts();

    return successResponse( res, 200, "Active products retrieved successfully", products );
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const product = await productService.getProductById(id);

    return successResponse( res, 200, "Product retrieved successfully", product );
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    const product = await productService.createProduct(
      name,
      description,
      category,
    );

    return successResponse( res, 201, "Product created successfully", product );
  } catch (error) {
    next(error);
  }
};

const getAllProductsForAdmin = async (req, res, next) => {
  try {
    const products = await productService.getAllProductsForAdmin();

    return successResponse( res, 200, "Products retrieved successfully", products );
  } catch (error) {
    next(error);
  }
};

const getProductByIdForAdmin = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const product = await productService.getProductByIdForAdmin(id);

    return successResponse( res, 200, "Product retrieved successfully", product );
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const { name, description, category } = req.body;

    const product = await productService.updateProduct(
      id,
      name,
      description,
      category,
    );

    return successResponse( res, 200, "Product updated successfully", product );
  } catch (error) {
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const { is_active } = req.body;

    const product = await productService.updateProductStatus(id, is_active);

    return successResponse( res, 200, "Product status updated successfully", product );
  } catch (error) {
    next(error);
  }
};

const createProductVariant = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const { variant_name, price, stock } = req.body;

    const variant = await productService.createProductVariant(
      productId,
      variant_name,
      Number(price),
      Number(stock),
    );

    return successResponse( res, 201, "Product variant created successfully", variant );
  } catch (error) {
    next(error);
  }
};

const getProductVariantsForAdmin = async (
    req,
    res,
    next
) => {

    try {

        const productId =
            Number(req.params.productId);


        const variants =
            await productService.getProductVariantsForAdmin(
                productId
            );


        return successResponse( res, 200, "Product variants retrieved successfully", variants );

    } catch (error) {

        next(error);

    }
};

const updateProductVariant = async (
    req,
    res,
    next
) => {

    try {

        const id = Number(req.params.id);

        const {
            variant_name,
            price,
            stock
        } = req.body;


        const variant =
            await productService.updateProductVariant(
                id,
                variant_name,
                Number(price),
                Number(stock)
            );


        return successResponse( res, 200, "Product variant updated successfully", variant );

    } catch (error) {

        next(error);

    }
};

const updateProductVariantStatus = async (
    req,
    res,
    next
) => {
    try {

        const id = Number(req.params.id);

        const { is_active } = req.body;

        const variant =
            await productService.updateProductVariantStatus(
                id,
                is_active
            );

        return successResponse( res, 200, "Product variant status updated successfully", variant );

    } catch (error) {
        next(error);
    }
};

module.exports = {
  getActiveProducts,
  getProductById,
  createProduct,
  getAllProductsForAdmin,
  getProductByIdForAdmin,
  updateProduct,
  updateProductStatus,
  createProductVariant,
  getProductVariantsForAdmin,
  updateProductVariant,
  updateProductVariantStatus
};
