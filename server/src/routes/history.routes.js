import express from "express";
import { historyRequest, historyDelete, historyBulkDelete } from "#controllers/history.controller.js";
import { protect } from "#middlewares/auth.middleware.js";

const router = express.Router();

router.get("/history", protect, historyRequest);

// NOTE: "/history/bulk" must be registered before "/history/:id",
// otherwise Express will match "bulk" as the :id param on the route below.
router.delete("/history/bulk", protect, historyBulkDelete);
router.delete("/history/:id", protect, historyDelete);

export default router;