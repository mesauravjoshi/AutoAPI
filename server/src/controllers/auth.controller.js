// controllers/auth.controller.js
import * as authService from "#services/auth.service.js";

export const signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      workspace: result.workspace,
      token: result.accessToken,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    const result = await authService.refreshToken(token);

    return res.status(200).json({
      token: result.accessToken,
    });
  } catch (err) {
    // Clear the cookie if refresh fails
    res.clearCookie("refreshToken");
    return res.status(err.status || 401).json({
      message: err.message || "Unauthorized",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    await authService.logout(req.user._id);

    // Clear the refresh token cookie
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};