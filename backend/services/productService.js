const pool = require("../config/db")
const AppError = require("../errors/AppError")

const getActiveProducts = async () => {
    const [products] = await pool.query(
        `SELECT
        id,
        name,
        description,
        category,
        is_active,
        created_at
        FROM products
        WHERE is_active = TRUE
        ORDER BY created_at DESC`
    )

    return products;
}

const getProductById = async (id) => {

    // 1. ดึง Product
    const [products] = await pool.query(
        `SELECT
            id,
            name,
            description,
            category,
            is_active,
            created_at
         FROM products
         WHERE id = ?
         AND is_active = TRUE`,
        [id]
    );

    if (products.length === 0) {
        throw new AppError(
            "Product not found",
            404
        );

        
    }

    const product = products[0];


    // 2. ดึง Variants
    const [variants] = await pool.query(
        `SELECT
            id,
            variant_name,
            price,
            stock,
            is_active,
            created_at
         FROM product_variants
         WHERE product_id = ?
         AND is_active = TRUE
         ORDER BY id ASC`,
        [id]
    );


    // 3. รวมข้อมูล
    return {
        ...product,
        variants
    };
};

const createProduct = async (
    name,
    description,
    category
) => {

    

    const [result] = await pool.query(
        `INSERT INTO products
        (
            name,
            description,
            category
        )
        VALUES (?, ?, ?)`,
        [
            name.trim(),
            description || null,
            category || null
        ]
    );


    const [products] = await pool.query(
        `SELECT
            id,
            name,
            description,
            category,
            is_active,
            created_at
         FROM products
         WHERE id = ?`,
        [result.insertId]
    );


    return products[0];
};

const getAllProductsForAdmin = async () => {

    const [products] = await pool.query(
        `SELECT
            id,
            name,
            description,
            category,
            is_active,
            created_at
         FROM products
         ORDER BY created_at DESC`
    );

    return products;
};

const getProductByIdForAdmin = async (id) => {

    const [products] = await pool.query(
        `SELECT
            id,
            name,
            description,
            category,
            is_active,
            created_at
         FROM products
         WHERE id = ?`,
        [id]
    );

    if (products.length === 0) {
        throw new AppError(
            "Product not found",
            404
        );
    }

    const product = products[0];


    const [variants] = await pool.query(
        `SELECT
            id,
            product_id,
            variant_name,
            price,
            stock,
            is_active,
            created_at
         FROM product_variants
         WHERE product_id = ?
         ORDER BY id ASC`,
        [id]
    );


    return {
        ...product,
        variants
    };
};

const updateProduct = async (
    id,
    name,
    description,
    category
) => {

    // ตรวจสอบก่อนว่า Product มีอยู่หรือไม่
    const [products] = await pool.query(
        `SELECT id
         FROM products
         WHERE id = ?`,
        [id]
    );


    if (products.length === 0) {
        throw new AppError(
            "Product not found",
            404
        );
    }


    // Update
    await pool.query(
        `UPDATE products
         SET
            name = ?,
            description = ?,
            category = ?
         WHERE id = ?`,
        [
            name.trim(),
            description || null,
            category || null,
            id
        ]
    );


    // ดึงข้อมูลล่าสุดกลับมา
    const [updatedProducts] = await pool.query(
        `SELECT
            id,
            name,
            description,
            category,
            is_active,
            created_at
         FROM products
         WHERE id = ?`,
        [id]
    );


    return updatedProducts[0];
};

const updateProductStatus = async (
    id,
    isActive
) => {

    // ตรวจสอบว่า Product มีอยู่หรือไม่
    const [products] = await pool.query(
        `SELECT id
         FROM products
         WHERE id = ?`,
        [id]
    );


    if (products.length === 0) {
        throw new AppError(
            "Product not found",
            404
        );
    }


    // เปลี่ยนสถานะ
    await pool.query(
        `UPDATE products
         SET is_active = ?
         WHERE id = ?`,
        [
            isActive,
            id
        ]
    );


    // ดึงข้อมูลล่าสุด
    const [updatedProducts] = await pool.query(
        `SELECT
            id,
            name,
            description,
            category,
            is_active,
            created_at
         FROM products
         WHERE id = ?`,
        [id]
    );


    return updatedProducts[0];
};

const createProductVariant = async (
    productId,
    variantName,
    price,
    stock
) => {

    // ตรวจสอบ Product
    const [products] = await pool.query(
        `SELECT id
         FROM products
         WHERE id = ?`,
        [productId]
    );


    if (products.length === 0) {
        throw new AppError(
            "Product not found",
            404
        );
    }


    // สร้าง Variant
    const [result] = await pool.query(
        `INSERT INTO product_variants
        (
            product_id,
            variant_name,
            price,
            stock
        )
        VALUES (?, ?, ?, ?)`,
        [
            productId,
            variantName.trim(),
            price,
            stock
        ]
    );


    // ดึงข้อมูลที่สร้างกลับมา
    const [variants] = await pool.query(
        `SELECT
            id,
            product_id,
            variant_name,
            price,
            stock,
            is_active,
            created_at
         FROM product_variants
         WHERE id = ?`,
        [result.insertId]
    );

    if (variants.length === 0) { throw new AppError( "Variant not found", 404 ); }

    


    return variants[0];
};

const getProductVariantsForAdmin = async (productId) => {

    // ตรวจสอบก่อนว่า Product มีอยู่หรือไม่
    const [products] = await pool.query(
        `SELECT id
         FROM products
         WHERE id = ?`,
        [productId]
    );

    if (products.length === 0) {
        throw new AppError(
            "Product not found",
            404
        );
    }


    // ดึง Variant ทั้งหมดของ Product
    const [variants] = await pool.query(
        `SELECT
            id,
            product_id,
            variant_name,
            price,
            stock,
            is_active,
            created_at
         FROM product_variants
         WHERE product_id = ?
         ORDER BY id ASC`,
        [productId]
    );


    return variants;
};

const updateProductVariant = async (
    id,
    variantName,
    price,
    stock
) => {

    // ตรวจสอบ Variant
    const [variants] = await pool.query(
        `SELECT
            id,
            product_id
         FROM product_variants
         WHERE id = ?`,
        [id]
    );


    if (variants.length === 0) {
        throw new AppError(
            "Variant not found",
            404
        );
    }


    // Update
    await pool.query(
        `UPDATE product_variants
         SET
            variant_name = ?,
            price = ?,
            stock = ?
         WHERE id = ?`,
        [
            variantName.trim(),
            price,
            stock,
            id
        ]
    );


    // ดึงข้อมูลล่าสุด
    const [updatedVariants] = await pool.query(
        `SELECT
            id,
            product_id,
            variant_name,
            price,
            stock,
            is_active,
            created_at
         FROM product_variants
         WHERE id = ?`,
        [id]
    );


    return updatedVariants[0];
};

const updateProductVariantStatus = async (
    id,
    isActive
) => {

    // 1. ตรวจสอบว่า Variant มีอยู่จริง
    const [variants] = await pool.query(
        `SELECT id
         FROM product_variants
         WHERE id = ?`,
        [id]
    );

    if (variants.length === 0) {
        throw new AppError(
            "Variant not found",
            404
        );
    }

    // 2. เปลี่ยนสถานะ
    await pool.query(
        `UPDATE product_variants
         SET is_active = ?
         WHERE id = ?`,
        [
            isActive,
            id
        ]
    );

    // 3. ดึงข้อมูลล่าสุดกลับมา
    const [updatedVariants] = await pool.query(
        `SELECT
            id,
            product_id,
            variant_name,
            price,
            stock,
            is_active,
            created_at
         FROM product_variants
         WHERE id = ?`,
        [id]
    );

    return updatedVariants[0];
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
}