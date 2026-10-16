const authService = require("../services/authService");
const { successResponse } = require("../utils/response");
const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearRefreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    return successResponse(res, 201, "Register successful", user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);

    return successResponse(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    const result = await authService.refresh(refreshToken);

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);

    return successResponse(res, 200, "Access token refreshed successfully", {
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    await authService.logout(refreshToken);

    res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions);

    return successResponse(res, 200, "Logout successful");
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout };
