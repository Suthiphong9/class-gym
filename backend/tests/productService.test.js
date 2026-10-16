jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

const pool = require("../config/db");
const AppError = require("../errors/AppError");
const productService = require("../services/productService");

describe("Product Service - Unit Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getActiveProducts", () => {
    it("should return active products", async () => {
      // Arrange: เตรียมข้อมูลจำลอง
      const mockProducts = [
        {
          id: 1,
          name: "Protein Bar",
          description: "Chocolate flavor",
          category: "Snack",
          is_active: 1,
        },
        {
          id: 2,
          name: "Protein Shake",
          description: null,
          category: "Drink",
          is_active: 1,
        },
      ];

      pool.query.mockResolvedValueOnce([mockProducts]);

      // Act: เรียก Service จริง
      const result = await productService.getActiveProducts();

      // Assert: ตรวจสอบผลลัพธ์
      expect(result).toEqual(mockProducts);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE is_active = TRUE"),
      );
    });
  });

  describe("getProductById", () => {
    it("should return product with active variants", async () => {
      // Arrange
      const mockProduct = {
        id: 1,
        name: "Protein Bar",
        description: "Chocolate flavor",
        category: "Snack",
        is_active: 1,
      };

      const mockVariants = [
        {
          id: 10,
          variant_name: "Box of 6",
          price: 300,
          stock: 20,
          is_active: 1,
        },
        {
          id: 11,
          variant_name: "Box of 12",
          price: 550,
          stock: 15,
          is_active: 1,
        },
      ];

      // Query ครั้งที่ 1: ดึง Product
      pool.query.mockResolvedValueOnce([[mockProduct]]);

      // Query ครั้งที่ 2: ดึง Variants
      pool.query.mockResolvedValueOnce([mockVariants]);

      // Act
      const result = await productService.getProductById(1);

      // Assert
      expect(result).toEqual({
        ...mockProduct,
        variants: mockVariants,
      });

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("FROM product_variants"),
        [1],
      );
    });

    it("should throw AppError 404 when product does not exist", async () => {
      // Arrange: ไม่พบ Product
      pool.query.mockResolvedValueOnce([[]]);

      // Act + Assert
      await expect(productService.getProductById(999)).rejects.toThrow(
        expect.objectContaining({
          message: "Product not found",
          statusCode: 404,
        }),
      );

      // ต้องหยุดหลัง Query หา Product
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
  describe("createProduct", () => {
    it("should create a product and convert empty values to null", async () => {
      const mockProduct = {
        id: 42,
        name: "Protein Bar",
        description: null,
        category: null,
      };

      // Mock การ INSERT สินค้า
      pool.query.mockResolvedValueOnce([{ insertId: 42 }]);

      // Mock การ SELECT สินค้าที่สร้างแล้ว
      pool.query.mockResolvedValueOnce([[mockProduct]]);

      const result = await productService.createProduct(
        "  Protein Bar  ",
        "",
        undefined,
      );

      expect(result).toEqual(mockProduct);

      expect(pool.query).toHaveBeenCalledTimes(2);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO products"),
        ["Protein Bar", null, null],
      );
    });
    it("should throw an error when database insert fails", async () => {
      // Arrange: จำลองว่า INSERT ฐานข้อมูลล้มเหลว
      const dbError = new Error("Database connection failed");

      pool.query.mockRejectedValueOnce(dbError);

      // Act + Assert: Service ต้องส่งต่อ Error
      await expect(
        productService.createProduct(
          "Protein Bar",
          "Chocolate flavor",
          "Snack",
        ),
      ).rejects.toThrow("Database connection failed");

      // INSERT ล้มเหลว จึงควรเรียก Query เพียงครั้งเดียว
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("should trim whitespace from product name", async () => {
      const mockProduct = {
        id: 43,
        name: "Protein Shake",
        description: "Vanilla flavor",
        category: "Drink",
      };

      pool.query.mockResolvedValueOnce([{ insertId: 43 }]);

      pool.query.mockResolvedValueOnce([[mockProduct]]);

      const result = await productService.createProduct(
        "  Protein Shake  ",
        "Vanilla flavor",
        "Drink",
      );

      expect(result).toEqual(mockProduct);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO products"),
        ["Protein Shake", "Vanilla flavor", "Drink"],
      );
    });
  });
});
