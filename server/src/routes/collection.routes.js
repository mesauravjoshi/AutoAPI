import express from "express";
import {
  getCollections,
  createCollection,
  deleteCollection
} from "#controllers/collection.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

router.get("/collection/:workspaceId", protect, getCollections);
router.post("/collection", protect, createCollection);
router.delete("/collection/:id", protect, deleteCollection);

export default router;