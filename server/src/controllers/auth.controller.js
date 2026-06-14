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
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    await authService.logout(req.token);
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};