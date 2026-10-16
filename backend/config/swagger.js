const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Class Gym API",
      version: "1.0.0",
      description: "API Documentation for Class Gym Backend",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Protein Bar",
            },
            description: {
              type: "string",
              example: "Chocolate flavor",
            },
            price: {
              type: "number",
              example: 120,
            },
          },
        },

        ProductCreate: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: {
              type: "string",
              example: "Protein Bar",
            },
            description: {
              type: "string",
              example: "Chocolate flavor",
            },
            price: {
              type: "number",
              example: 120,
            },
          },
        },

        ProductUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "Protein Bar Chocolate",
            },
            description: {
              type: "string",
              example: "Chocolate flavor updated",
            },
            price: {
              type: "number",
              example: 130,
            },
          },
        },

        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Product not found",
            },
          },
        },

        ApiSuccess: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Request successful",
            },
            data: {
              type: "object",
            },
          },
        },

        ProductResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Product retrieved successfully",
            },
            data: {
              $ref: "#/components/schemas/Product",
            },
          },
        },

        ProductListResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Products retrieved successfully",
            },

            data: {
              type: "array",

              items: {
                $ref: "#/components/schemas/Product",
              },
            },
          },
        },

        Pagination: {
          type: "object",

          properties: {
            page: {
              type: "integer",
              example: 1,
            },

            limit: {
              type: "integer",
              example: 10,
            },

            total: {
              type: "integer",
              example: 25,
            },

            totalPages: {
              type: "integer",
              example: 3,
            },
          },
        },
        ProductPaginationResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Products retrieved successfully",
            },

            data: {
              type: "array",

              items: {
                $ref: "#/components/schemas/Product",
              },
            },

            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },
        ProductVariantListResponse: {
          type: "object",
          properties: {
            success: {
              
            }
          }
        }

      },
    },
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
