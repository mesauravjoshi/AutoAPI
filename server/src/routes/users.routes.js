import express from "express";
import { getUsers } from "#controllers/users.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", protect, getUsers);

export default router;
