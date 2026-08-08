import express from "express";
import {
  passwordStatus,
  createPasswordHandler,
  changePasswordHandler,
  updateProfileHandler,
  updateEmailHandler,
} from "#controllers/profile.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

// All profile routes require authentication
router.get("/profile/password-status", protect, passwordStatus);
router.post("/profile/create-password", protect, createPasswordHandler);
router.put("/profile/change-password", protect, changePasswordHandler);
router.put("/profile/update-profile", protect, updateProfileHandler);
router.put("/profile/update-email", protect, updateEmailHandler);

export default router;
