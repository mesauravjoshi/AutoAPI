import express from "express";
import { addWorkspace, getWorkspace, deleteWorkspace } from "#controllers/workspace.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

router.get("/workspaces", protect, getWorkspace);
router.post("/workspaces", protect, addWorkspace);
router.delete("/workspaces/:id", protect, deleteWorkspace);

export default router;
