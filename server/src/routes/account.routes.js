import express from "express";
import { deleteAccount } from "#controllers/account.controller.js";
import { protect } from "#middlewares/auth.middleware.js";
import { strictRateLimiter } from "#middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Support both DELETE and POST for account deletion with email confirmation
router.delete("/account/delete", protect, strictRateLimiter, deleteAccount);

export default router;
