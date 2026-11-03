import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "#controllers/auth.controller.js";
import { googleLogin } from "#controllers/google.login.controller.js";
import { protect } from "#middlewares/auth.middleware.js";
import {
  loginRegisterLimiter,
  googleOAuthLimiter,
  refreshTokenLimiter,
} from "#middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.post("/signup", loginRegisterLimiter, signup);
router.post("/login", loginRegisterLimiter, login);
router.post("/google", googleOAuthLimiter, googleLogin);
router.post("/refresh-token", refreshTokenLimiter, refreshToken);
router.post("/logout", protect, logout);

export default router;