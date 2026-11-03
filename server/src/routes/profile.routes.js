import express from "express";
import {
  passwordStatus,
  createPasswordHandler,
  changePasswordHandler,
  updateProfileHandler,
  updateEmailHandler,
} from "#controllers/profile.controller.js";
import { protect } from "#middlewares/auth.middleware.js";
import {
  readLimiter,
  passwordResetLimiter,
  writeLimiter,
} from "#middlewares/rateLimiter.middleware.js";

const router = express.Router();

// All profile routes require authentication
router.get("/profile/password-status", protect, readLimiter, passwordStatus);
router.post("/profile/create-password", protect, passwordResetLimiter, createPasswordHandler);
router.put("/profile/change-password", protect, changePasswordHandler);
router.put("/profile/update-profile", protect, writeLimiter, updateProfileHandler);
router.put("/profile/update-email", protect, writeLimiter, updateEmailHandler);

export default router;
