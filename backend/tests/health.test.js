afterAll(async () => {
  await closePool();
});

const request = require("supertest");
const app = require("../app");
const closePool = require("./teardown");


describe("GET /health", () => {
    it("should return 200 when the database is connected", async () => {


        const response = await request(app)
            .get("/health")
            .timeout({
                response: 10000,
                deadline: 12000
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.database).toBe("up");
    }, 15000);
});