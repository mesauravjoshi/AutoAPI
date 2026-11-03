import express from "express";
import {
  apiExecutionLimiter,
  writeLimiter,
  // requestHistoryLimiter,
} from "#middlewares/rateLimiter.middleware.js";
import {
  sendRequest, sendLocalAgentRequest,
  createCollectionRequest
} from "#controllers/request.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

router.post("/request", protect, apiExecutionLimiter, sendRequest);
router.post("/collection/:collectionId/requests", protect, writeLimiter, createCollectionRequest);
// router.post("/request/bulk", protect, bulkCreateRequests);
router.post("/local-agent/request", protect, sendLocalAgentRequest);

export default router;