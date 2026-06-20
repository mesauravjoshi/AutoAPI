import express from "express";
import { addWorkspace, getWorkspace } from "#controllers/workspace.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

router.get("/workspaces", protect, getWorkspace);
router.post("/workspaces", protect, addWorkspace);

export default router;
