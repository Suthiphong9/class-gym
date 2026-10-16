afterAll(async () => {
  await closePool();
});

jest.mock("../services/authService", () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const authService = require("../services/authService");
const closePool = require("./teardown");


describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should set an HttpOnly refresh token cookie without exposing the refresh token in JSON", async () => {
      const refreshToken = "test-refresh-token-secret";

      authService.login.mockResolvedValue({
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          role: "user",
        },
        accessToken: "test-access-token",
        refreshToken,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const refreshCookie = cookies.find((cookie) =>
        cookie.startsWith("refreshToken="),
      );

      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toMatch(/HttpOnly/i);
      expect(refreshCookie).toMatch(/Path=\/api\/auth/i);

      expect(JSON.stringify(response.body)).not.toContain(refreshToken);
      expect(JSON.stringify(response.body)).toContain("test-access-token");

      expect(authService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should read the refresh token from the cookie and return new tokens", async () => {
      authService.refresh.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", "refreshToken=old-refresh-token");

      expect(response.status).toBe(200);
      expect(authService.refresh).toHaveBeenCalledWith(
        "old-refresh-token",
      );

      expect(JSON.stringify(response.body)).toContain(
        "new-access-token",
      );
      expect(JSON.stringify(response.body)).not.toContain(
        "new-refresh-token",
      );

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const refreshCookie = cookies.find((cookie) =>
        cookie.startsWith("refreshToken="),
      );

      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain("new-refresh-token");
      expect(refreshCookie).toMatch(/HttpOnly/i);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should revoke the refresh token and clear the cookie", async () => {
      authService.logout.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", "refreshToken=old-refresh-token");

      expect(response.status).toBe(200);
      expect(authService.logout).toHaveBeenCalledWith(
        "old-refresh-token",
      );

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const clearedCookie = cookies.find((cookie) =>
        cookie.startsWith("refreshToken="),
      );

      expect(clearedCookie).toBeDefined();
      expect(clearedCookie).toMatch(/Path=\/api\/auth/i);
      expect(clearedCookie).toMatch(/Expires=/i);
    });
  });
  
  
describe("Security validation", () => {
  it("should return 400 when login credentials are missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(
      /email and password are required/i,
    );
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("should return 401 when refreshing without a cookie", async () => {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    error.isOperational = true;

    authService.refresh.mockRejectedValueOnce(error);

    const response = await request(app)
      .post("/api/auth/refresh");

    expect(response.status).toBe(401);
    expect(authService.refresh).toHaveBeenCalledWith(undefined);
  });

  it("should return 401 when logging out without a cookie", async () => {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    error.isOperational = true;

    authService.logout.mockRejectedValueOnce(error);

    const response = await request(app)
      .post("/api/auth/logout");

    expect(response.status).toBe(401);
    expect(authService.logout).toHaveBeenCalledWith(undefined);
  });
});


});
