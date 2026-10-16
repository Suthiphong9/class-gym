afterAll(async () => {
  await closePool();
});

jest.mock("../services/productService", () => ({
  getActiveProducts: jest.fn(),
  getProductById: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const productService = require("../services/productService");
const closePool = require("./teardown");

describe("Products API - Integration Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("GET /api/products", () => {
    it("should return 200 and active products", async () => {
      // Arrange: จำลองข้อมูลที่ Service ส่งกลับมา
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

      productService.getActiveProducts.mockResolvedValueOnce(mockProducts);

      // Act: เรียก API ผ่าน Express จริง
      const response = await request(app).get("/api/products");

      // Assert: ตรวจสอบ HTTP Response
      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Active products retrieved successfully",
        data: mockProducts,
      });

      // ตรวจสอบว่า Controller เรียก Service
      expect(productService.getActiveProducts).toHaveBeenCalledTimes(1);
    });
    it("should return 500 when service throws an error", async () => {
      productService.getActiveProducts.mockRejectedValueOnce(
        new Error("Database connection failed"),
      );

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(500);
      expect(productService.getActiveProducts).toHaveBeenCalledTimes(1);
    });
  });
});

describe("GET /api/products/:id", () => {
  it("should return 200 and product with variants", async () => {
    const mockProduct = {
      id: 1,
      name: "Protein Bar",
      description: "Chocolate flavor",
      category: "Snack",
      variants: [
        {
          id: 10,
          variant_name: "Box of 6",
          price: 300,
          stock: 20,
        },
      ],
    };

    productService.getProductById.mockResolvedValueOnce(mockProduct);

    const response = await request(app).get("/api/products/1");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Product retrieved successfully",
      data: mockProduct,
    });

    expect(productService.getProductById).toHaveBeenCalledWith(1);
  });
  it("should return 404 when product does not exist", async () => {
    const AppError = require("../errors/AppError");

    productService.getProductById.mockRejectedValueOnce(
      new AppError("Product not found", 404),
    );

    const response = await request(app).get("/api/products/999");

    expect(response.status).toBe(404);
    expect(productService.getProductById).toHaveBeenCalledWith(999);
  });
});
